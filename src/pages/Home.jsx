import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CornerDownLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { apiService } from '../services/api';
import { Settings } from '../components/Settings';
import { HistoryList } from '../components/HistoryList';

export const Home = ({
  speak,
  speaking,
  rate,
  setRate,
  useBackendTTS,
  setUseBackendTTS,
  makeAnnouncement
}) => {
  const [appState, setAppState] = useState('welcome');
  const [statusMsg, setStatusMsg] = useState('Welcome to BlindCalc');
  const [queryText, setQueryText] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Stores the last successful result for quick replay
  const [lastResult, setLastResult] = useState(null);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  const textInputRef = useRef(null);

  const {
    recording,
    startRecording,
    stopRecording,
    playBeep,
    playStartBeep,
    playStopBeep,
    playProcessingBeep,
    playSuccessBeep,
    playErrorBeep,
    playWarningBeep
  } = useSpeechRecognition();

  // Sync status messages to app states
  useEffect(() => {
    switch (appState) {
      case 'welcome':
        setStatusMsg('Welcome to BlindCalc');
        break;
      case 'IDLE':
        setStatusMsg("Waiting for 'Start'...");
        break;
      case 'LISTENING':
        setStatusMsg('Listening for question...');
        break;
      case 'PROCESSING':
        setStatusMsg('Processing...');
        break;
      case 'SPEAKING':
        setStatusMsg('Speaking...');
        break;
      case 'COMMAND_WAIT':
        setStatusMsg('Waiting for command...');
        break;
      default:
        setStatusMsg('Ready');
    }
  }, [appState]);

  // Voice loop state transition manager
  useEffect(() => {
    console.log("STATE:", appState);

    if (appState === 'IDLE') {
      startPassiveListening();
    }

    else if (appState === 'LISTENING') {
      startMathQuestionRecording();
    }

    else if (appState === 'COMMAND_WAIT') {
      startCommandListening();
    }

  }, [appState]);

  // Welcome message on mount
  useEffect(() => {

    let mounted = true;

    const timer = setTimeout(() => {

      if (!mounted) return;

      speak(
        "Welcome to BlindCalc. Say Start to begin.",
        () => {
          if (mounted) {
            setAppState('IDLE');
          }
        }
      );

    }, 1500);


    return () => {
      mounted = false;
      clearTimeout(timer);
    };

  }, []);
  const startPassiveListening = async () => {

    if (calculating) {
      console.log("Already processing, skipping passive listener");
      return;
    }
    setErrorMsg(null);
    try {
      await startRecording(async (audioBlob) => {
        setAppState('PROCESSING');
        try {
          const data = await apiService.transcribeVoice(audioBlob);
          const transcript = data.text || "";
          console.log("Transcript:", transcript);

          const text = transcript.toLowerCase().trim();
          if (
            text.includes("start") ||
            text.includes("start calculator") ||
            text.includes("begin") ||
            text.includes("hello calculator")
          ) {
            console.log("Wake word detected");
            setAppState('LISTENING');
          } else {
            console.log("Wake word not detected. Restarting passive listening after delay.");

            setTimeout(() => {
              setAppState('IDLE');
            }, 1500);
          }
        } catch (err) {
          console.error("Transcribe error in passive listening:", err);
          setAppState('IDLE');
        }
      });
    } catch (err) {
      console.error("Microphone start failed in IDLE:", err);
      playWarningBeep();
      setErrorMsg("Microphone access denied or unavailable.");
      speak("Error. Microphone access was denied. Please check your browser settings.");
      makeAnnouncement("Error. Microphone access was denied. Please check your browser settings.");
    }
  };

  const startMathQuestionRecording = async () => {
    setErrorMsg(null);
    try {
      if (calculating) return;
      await startRecording(async (audioBlob) => {
        setAppState('PROCESSING');
        playProcessingBeep();

        try {
          // Send audio directly to voice-calculate
          const result = await apiService.calculateVoice(audioBlob);
          playSuccessBeep();

          console.log("Transcript:", result.query);
          console.log("Math query:", result.query);

          setLastResult(result);
          setAppState('SPEAKING');

          const speechText = result.explanation
            ? `${result.explanation} The answer is ${result.result_spoken}`
            : `The calculation result is ${result.result_spoken}`;

          speak(
            speechText + ". Say Next, Repeat, or Exit.",
            () => {
              setAppState('COMMAND_WAIT');
            }
          );
          setHistoryTrigger(prev => prev + 1);
        } catch (err) {
          console.error("Math question evaluation failed:", err);
          playErrorBeep();
          setErrorMsg(err.message || 'Failed to evaluate equation.');
          setAppState('SPEAKING');
          speak(
            `Error. ${err.message || 'Failed to process voice input.'}. Say Next, Repeat, or Exit.`,
            () => {
              setAppState('COMMAND_WAIT');
            }
          );
        }
      });
    } catch (err) {
      console.error("Microphone start failed in LISTENING:", err);
      playWarningBeep();
      setErrorMsg("Microphone access denied or unavailable.");
      setAppState('COMMAND_WAIT');
    }
  };

  const startCommandListening = async () => {
    if (calculating) {
      console.log("Already processing command");
      return;
    }
    setErrorMsg(null);
    try {
      await startRecording(async (audioBlob) => {
        setAppState('PROCESSING');
        playProcessingBeep();

        try {
          const data = await apiService.transcribeVoice(audioBlob);
          const transcript = data.text || "";
          console.log("Transcript:", transcript);
          console.log("Command:", transcript);

          const text = transcript.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

          const isNext = /^(next|next question|continue|another|new question)$/i.test(text);
          const isRepeat = /^(repeat|say again|again|replay)$/i.test(text);
          const isExit = /^(exit|quit|close|goodbye)$/i.test(text);

          if (isNext) {
            setAppState('LISTENING');
          } else if (isRepeat) {
            if (lastResult) {
              setAppState('SPEAKING');
              playSuccessBeep();
              const speechText = lastResult.explanation
                ? `${lastResult.explanation} The answer is ${lastResult.result_spoken}`
                : `The calculation result is ${lastResult.result_spoken}`;
              speak(speechText + ". Say Next, Repeat, or Exit.", () => {
                setAppState('COMMAND_WAIT');
              });
            } else {
              setAppState('SPEAKING');
              speak("No previous calculation result available. Say Next, Repeat, or Exit.", () => {
                setAppState('COMMAND_WAIT');
              });
            }
          } else if (isExit) {
            setAppState('SPEAKING');
            speak("Goodbye.", () => {
              // Return to IDLE passive listening state
              setAppState('IDLE');
              setLastResult(null);
              setErrorMsg(null);
            });
          } else {
            // Unknown command
            playErrorBeep();
            setAppState('SPEAKING');
            speak("I didn't understand. Please say Next, Repeat, or Exit.", () => {
              setAppState('COMMAND_WAIT');
            });
          }
        } catch (err) {
          console.error("Command parsing failed:", err);
          playErrorBeep();
          setAppState('SPEAKING');
          speak("Failed to process command. Please say Next, Repeat, or Exit.", () => {
            setAppState('COMMAND_WAIT');
          });
        }
      });
    } catch (err) {
      console.error("Microphone start failed in COMMAND_WAIT:", err);
      playWarningBeep();
      setErrorMsg("Microphone access denied or unavailable.");
      setAppState('IDLE');
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setCalculating(true);
    setErrorMsg(null);
    setAppState('PROCESSING');
    makeAnnouncement('Submitting text calculation request.');

    try {
      const result = await apiService.calculateText(queryText);
      playSuccessBeep();
      setLastResult(result);
      setAppState('SPEAKING');

      const speechText = result.explanation
        ? `${result.explanation} The answer is ${result.result_spoken}`
        : `The calculation result is ${result.result_spoken}`;

      speak(
        speechText + ". Say Next, Repeat, or Exit.",
        () => {
          setAppState('COMMAND_WAIT');
        }
      );
      setQueryText('');
      setHistoryTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
      playErrorBeep();
      setErrorMsg(err.message || 'Failed to evaluate equation.');
      setAppState('SPEAKING');
      speak(
        `Error. ${err.message || 'Failed to evaluate equation.'}. Say Next, Repeat, or Exit.`,
        () => {
          setAppState('COMMAND_WAIT');
        }
      );
    } finally {
      setCalculating(false);
    }
  };

  const repeatLastSpeech = () => {
    if (lastResult) {
      setAppState('SPEAKING');
      const speechText = lastResult.explanation
        ? `${lastResult.explanation} The answer is ${lastResult.result_spoken}`
        : `The calculation result is ${lastResult.result_spoken}`;
      speak(speechText + ". Say Next, Repeat, or Exit.", () => {
        setAppState('COMMAND_WAIT');
      });
      makeAnnouncement('Repeating last answer.');
    } else {
      const fallbackText = "No previous calculation result available to replay.";
      speak(fallbackText);
      makeAnnouncement(fallbackText);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Visual Header / Screen Reader Guide */}
      <section className="glass-card" aria-labelledby="welcome-title" style={{ textAlign: 'center' }}>
        <h1 id="welcome-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          Voice Scientific Calculator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
          Solve algebra, statistics, matrices, derivatives, and integrals using hands-free voice control.
        </p>
      </section>

      {/* Record Work Area */}
      <section
        className="glass-card"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '300px', justifyContent: 'center' }}
        aria-label="Calculator workspace and status display"
      >
        {/* Massive Visual State Indicator / Microphone Graphic */}
        <div className="record-btn-container">
          <div
            className={`record-btn ${recording ? 'recording' : ''}`}
            style={{ cursor: 'default' }}
            aria-label={`Current voice assistant status: ${statusMsg}`}
          >
            {recording ? (
              <MicOff size={60} style={{ color: '#fff' }} aria-hidden="true" />
            ) : (
              <Mic size={60} style={{ color: '#fff' }} aria-hidden="true" />
            )}
          </div>

          <div className="record-btn-text" style={{ color: recording ? 'var(--danger)' : 'var(--accent)', fontWeight: 700, fontSize: '1.25rem' }}>
            {appState === 'welcome' && "Loading Assistant..."}
            {appState === 'IDLE' && "Say 'Start' to begin"}
            {appState === 'LISTENING' && "Listening for Question..."}
            {appState === 'PROCESSING' && "Processing speech..."}
            {appState === 'SPEAKING' && "Speaking..."}
            {appState === 'COMMAND_WAIT' && "Say Next, Repeat, or Exit"}
          </div>

          <p id="record-instructions" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' }}>
            BlindCalc is fully hands-free. Talk directly to the application.
          </p>
        </div>

        {/* Dynamic Calculation Status */}
        <div
          aria-live="polite"
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: recording ? 'var(--danger)' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '1rem 0'
          }}
        >
          {calculating && <RefreshCw className="animate-spin" size={20} />}
          <span>Status: {statusMsg}</span>
        </div>

        {/* Custom Text Input Fallback */}
        <form
          onSubmit={handleTextSubmit}
          style={{ width: '100%', maxWidth: '600px', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}
        >
          <label
            htmlFor="query-text-field"
            style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}
          >
            Or Type Your Mathematical Query:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="query-text-field"
              type="text"
              className="acc-input"
              ref={textInputRef}
              placeholder="e.g. Differentiate x^2 + 5x or Mean of 5, 10, 15, 20"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              disabled={calculating}
              aria-label="Mathematical formula input text field"
            />
            <button
              type="submit"
              className="acc-btn"
              style={{ marginTop: '0.5rem', height: '52px' }}
              disabled={calculating || !queryText.trim()}
              aria-label="Submit typed equation"
            >
              <CornerDownLeft size={20} />
            </button>
          </div>
        </form>
      </section>

      {/* Errors & Output Display Card */}
      {(errorMsg || lastResult) && (
        <section
          className="glass-card"
          aria-labelledby="output-title"
          style={{ borderLeft: errorMsg ? '6px solid var(--danger)' : '6px solid var(--accent)' }}
        >
          <h2 id="output-title" className="sr-only">Mathematical Outputs Result</h2>

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--danger)' }}>
              <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <div>
                <strong style={{ fontSize: '1.125rem' }}>Error Solving Problem</strong>
                <p style={{ marginTop: '0.25rem' }}>{errorMsg}</p>
              </div>
            </div>
          )}

          {lastResult && !errorMsg && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                  Latest Result ({lastResult.intent})
                </span>

                <button
                  className="acc-btn secondary"
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={repeatLastSpeech}
                  aria-label="Replay current spoken result audio"
                >
                  <Volume2 size={16} /> Replay Voice
                </button>
              </div>

              {lastResult.query && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Recognized Query:</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 600 }}>"{lastResult.query}"</div>
                </div>
              )}

              {lastResult.explanation && (
                <div style={{ marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  {lastResult.explanation}
                </div>
              )}

              {/* MathJax/Latex Output Box */}
              <div className="math-output-box" aria-label={`Result: ${lastResult.result_text}`}>
                <div className="math-latex" aria-hidden="true">
                  {lastResult.result_text}
                </div>
                <div className="math-spoken">
                  Spoken format: "{lastResult.result_spoken}"
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Embedded Settings Drawer */}
      <Settings
        rate={rate}
        setRate={setRate}
        useBackendTTS={useBackendTTS}
        setUseBackendTTS={setUseBackendTTS}
        speakTestResult={speak}
        makeAnnouncement={makeAnnouncement}
      />

      {/* Interactive History List */}
      <HistoryList
        speakText={speak}
        historyTrigger={historyTrigger}
        setHistoryTrigger={setHistoryTrigger}
        makeAnnouncement={makeAnnouncement}
      />

    </div>
  );
};
