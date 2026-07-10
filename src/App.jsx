import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Announcement string read by aria-live for screen-readers
  const [announcement, setAnnouncement] = useState('');

  // Speech output hook
  const {
    speak,
    stop,
    speaking,
    rate,
    setRate,
    useBackendTTS,
    setUseBackendTTS
  } = useSpeechSynthesis();
  const {
    recording,
    startRecording,
    stopRecording,
    playStartBeep
  } = useSpeechRecognition();

  // Keep body classes in sync with selected theme
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Method to trigger screen reader verbal announcements
  const makeAnnouncement = useCallback((text) => {
    setAnnouncement('');
    // Slight timeout ensures screen readers notice the text swap
    setTimeout(() => {
      setAnnouncement(text);
    }, 50);
  }, []);
  const handleVoiceInput = useCallback((text) => {
    const command = text.trim().toLowerCase();

    console.log("Voice input:", command);

    if (command.includes("start")) {
      setAnnouncement("Listening started");

      startRecording((audioBlob) => {
        console.log("Audio captured:", audioBlob);
      });


      return;
    }

    if (recording) {
      setAnnouncement(`You said: ${text}`);
    }
  }, [recording, startRecording]);

  useEffect(() => {
    const handler = (e) => {
      handleVoiceInput(e.detail);
    };

    window.addEventListener("voice-input", handler);

    return () => window.removeEventListener("voice-input", handler);
  }, [handleVoiceInput]);


  // Listen for global Alt + C to toggle High Contrast
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setTheme(prev => {
          const next = prev === 'high-contrast' ? 'dark' : 'high-contrast';
          makeAnnouncement(
            next === 'high-contrast'
              ? "High Contrast accessibility mode enabled"
              : "High Contrast mode disabled. Returned to dark theme."
          );
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [makeAnnouncement]);

  const handlePageNavigation = (page) => {
    setCurrentPage(page);
    makeAnnouncement(`Navigated to ${page === 'home' ? 'workspace' : 'about details'} page`);
  };

  return (
    <Layout
      theme={theme}
      setTheme={setTheme}
      currentPage={currentPage}
      setCurrentPage={handlePageNavigation}
      announcement={announcement}
    >
      {currentPage === 'home' ? (
        <Home
          speak={speak}
          speaking={speaking}
          rate={rate}
          setRate={setRate}
          useBackendTTS={useBackendTTS}
          setUseBackendTTS={setUseBackendTTS}
          makeAnnouncement={makeAnnouncement}
        />
      ) : (
        <About />
      )}
    </Layout>
  );
}

export default App;
