import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechRecognition = () => {
  const [recording, setRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const onStopCallbackRef = useRef(null);

  /**
   * Generates a beep sound using Web Audio API for screen-free accessibility feedback.
   * @param {number} pitch Frequency in Hz
   * @param {number} duration Duration in seconds
   * @param {string} type Oscillator waveform: 'sine', 'square', etc.
   */
  const playBeep = useCallback((pitch = 440, duration = 0.15, type = 'sine') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      // Prevent clicking sound at the end by ramping down gain
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser policies.", e);
    }
  }, []);

  const playStartBeep = useCallback(() => {
    // High beep
    playBeep(880, 0.15, 'sine');
  }, [playBeep]);

  const playStopBeep = useCallback(() => {
    // Low beep
    playBeep(330, 0.15, 'sine');
  }, [playBeep]);

  const playProcessingBeep = useCallback(() => {
    // Optional short tone
    playBeep(440, 0.08, 'sine');
  }, [playBeep]);

  const playSuccessBeep = useCallback(() => {
    // Soft success tone (C5 to E5 arpeggio)
    playBeep(523.25, 0.1, 'sine');
    setTimeout(() => playBeep(659.25, 0.15, 'sine'), 100);
  }, [playBeep]);

  const playErrorBeep = useCallback(() => {
    // Error tone (Low frequency triangle wave)
    playBeep(180, 0.25, 'triangle');
  }, [playBeep]);

  const playWarningBeep = useCallback(() => {
    // Warning tone (Double beep square wave)
    playBeep(220, 0.12, 'square');
    setTimeout(() => playBeep(220, 0.12, 'square'), 150);
  }, [playBeep]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      // Clear silence detection timers and frames
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (!mediaRecorderRef.current || !isRecordingRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        // Stop all track streams (closes microphone light)
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        audioContextRef.current?.close();

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });

        isRecordingRef.current = false;
        setRecording(false);
        console.log("Recording stopped");

        playStopBeep();

        if (onStopCallbackRef.current) {
          onStopCallbackRef.current(audioBlob);
        }
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [playStopBeep]);

  const startRecording = useCallback(async (onStopCallback = null) => {
    if (isRecordingRef.current) {
      console.log("Already recording");
      return;
    }

    console.log("Recording started");

    audioChunksRef.current = [];
    onStopCallbackRef.current = onStopCallback;

    // Stop any existing animation frames or timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecordingRef.current = true;
      setRecording(true);
      console.log("Microphone permission granted");

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Determine support for audio formats
      let optionsMedia = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        optionsMedia = { mimeType: 'audio/ogg' };
      }
      if (!MediaRecorder.isTypeSupported('audio/ogg')) {
        optionsMedia = { mimeType: '' }; // Fallback to browser default
      }

      const mediaRecorder = new MediaRecorder(stream, optionsMedia);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // Get chunks every 250ms
      console.log("MediaRecorder started");

      // Play start beep
      playStartBeep();

      // Start RMS silence detection volume monitoring
      const data = new Uint8Array(analyser.fftSize);
      const startTime = Date.now();
      let lastActiveTime = Date.now();

      const checkVolume = () => {
        if (!analyserRef.current || !isRecordingRef.current) return;
        analyser.getByteTimeDomainData(data);

        // RMS volume calculation
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const value = (data[i] - 128) / 128;
          sum += value * value;
        }
        const volume = Math.sqrt(sum / data.length);

        const elapsed = Date.now() - startTime;
        if (elapsed > 1500) { // Ignore the first 500 ms after recording starts
          if (volume > 0.04) {
            lastActiveTime = Date.now();
          }

          const silentDuration = Date.now() - lastActiveTime;
          if (silentDuration >= 3000) { // Silence duration = 1800 ms
            console.log("Silence limit of 1800 ms reached. Stopping recording.");
            stopRecording();
            return;
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      // Delay initial volume check calls by 500ms to avoid start beep / click interference
      setTimeout(() => {
        if (isRecordingRef.current) {
          lastActiveTime = Date.now();
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        }
      }, 500);

    } catch (err) {
      isRecordingRef.current = false;
      setRecording(false);
      throw err;
    }
  }, [playStartBeep, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
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
  };
};
