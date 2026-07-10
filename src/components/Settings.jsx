import React from 'react';
import { Volume2, Settings2, RefreshCw } from 'lucide-react';

export const Settings = ({ 
  rate, 
  setRate, 
  useBackendTTS, 
  setUseBackendTTS, 
  speakTestResult,
  makeAnnouncement
}) => {

  const handleRateChange = (e) => {
    const value = parseFloat(e.target.value);
    setRate(value);
    makeAnnouncement(`Speech speed updated to ${value.toFixed(1)} times`);
  };

  const toggleTTSMode = () => {
    const nextMode = !useBackendTTS;
    setUseBackendTTS(nextMode);
    makeAnnouncement(
      nextMode 
        ? "Switched to backend server-side speech generation" 
        : "Switched to browser local speech synthesis"
    );
  };

  const triggerTestSpeech = () => {
    const text = "Speech check. The voice speed is currently set to " + rate.toFixed(1);
    speakTestResult(text);
  };

  return (
    <section className="glass-card" aria-labelledby="settings-title" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Settings2 size={24} className="app-brand-accent" aria-hidden="true" />
        <h2 id="settings-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem' }}>
          Speech & Voice Settings
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Voice Rate Speed Control */}
        <div>
          <label 
            htmlFor="speech-rate-slider" 
            style={{ display: 'block', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}
          >
            Adjustable Speech Speed: <span style={{ color: 'var(--accent)' }}>{rate.toFixed(1)}x</span>
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              id="speech-rate-slider"
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
              style={{ flex: 1, height: '12px', cursor: 'pointer' }}
              aria-valuemin="0.5"
              aria-valuemax="2.5"
              aria-valuenow={rate}
              aria-valuetext={`${rate.toFixed(1)} times speed`}
            />
            <button
              className="acc-btn secondary"
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => {
                setRate(1.0);
                makeAnnouncement("Speech speed reset to normal");
              }}
              aria-label="Reset speech speed to normal"
            >
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* TTS Source Select Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div>
            <span style={{ display: 'block', fontWeight: 600, fontSize: '1.125rem' }}>
              Text-to-Speech Engine
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {useBackendTTS 
                ? "Server-side Python synthesis (offline pyttsx3/gTTS)" 
                : "Browser native WebSpeech API (recommended for zero latency)"}
            </span>
          </div>
          <button
            className={`acc-btn ${useBackendTTS ? 'secondary' : ''}`}
            onClick={toggleTTSMode}
            aria-label={useBackendTTS ? "Currently using backend speech. Click to switch to browser speech." : "Currently using browser speech. Click to switch to backend speech."}
          >
            {useBackendTTS ? "Use Client Speech" : "Use Server Speech"}
          </button>
        </div>

        {/* Voice Play Check */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button
            className="acc-btn"
            onClick={triggerTestSpeech}
            aria-label="Play test audio to check voice settings"
          >
            <Volume2 size={18} /> Test Voice Settings
          </button>
        </div>
      </div>
    </section>
  );
};
