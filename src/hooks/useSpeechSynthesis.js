import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';

export const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(() => {
    return parseFloat(localStorage.getItem('speechRate') || '1.0');
  });
  const [useBackendTTS, setUseBackendTTS] = useState(() => {
    return localStorage.getItem('useBackendTTS') === 'true';
  });
  
  const audioRef = useRef(null);

  // Synchronize speed settings
  useEffect(() => {
    localStorage.setItem('speechRate', rate.toString());
  }, [rate]);

  useEffect(() => {
    localStorage.setItem('useBackendTTS', useBackendTTS.toString());
  }, [useBackendTTS]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback((text, onEnd) => {
    if (!text) {
      onEnd?.();
      return;
    }
    
    // Always cancel active speech first
    stop();

    const handleBrowserFallback = () => {
      speakBrowser(text, onEnd);
    };

    if (useBackendTTS) {
      // 1. Backend pyttsx3/gTTS synthesis fallback
      setSpeaking(true);
      const url = apiService.getTTSUrl(text);
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setSpeaking(false);
        onEnd?.();
      };
      audio.onerror = (e) => {
        console.warn("Backend TTS failed, falling back to browser synthesis...", e);
        // Fallback directly to browser TTS
        handleBrowserFallback();
      };
      
      audio.play().catch(err => {
        console.error("Audio playback error:", err);
        // Fallback directly to browser TTS
        handleBrowserFallback();
      });
    } else {
      // 2. Client browser-native speech synthesis (Standard)
      handleBrowserFallback();
    }
  }, [stop, useBackendTTS, rate]);

  const speakBrowser = (text, onEnd) => {
    if (!window.speechSynthesis) {
      console.error("Browser speech synthesis not supported.");
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // speed adjust

    // Try selecting an English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && voice.localService
    ) || voices.find(voice => voice.lang.startsWith('en-'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setSpeaking(false);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  return {
    speak,
    stop,
    speaking,
    rate,
    setRate,
    useBackendTTS,
    setUseBackendTTS
  };
};
