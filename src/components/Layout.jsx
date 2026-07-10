import React, { useEffect, useRef } from 'react';
import { Sun, Moon, Eye, Info, Calculator, Keyboard } from 'lucide-react';

export const Layout = ({
  children,
  theme,
  setTheme,
  currentPage,
  setCurrentPage,
  announcement
}) => {

  const toggleContrast = () => {
    if (theme === 'high-contrast') {
      setTheme('dark');
    } else {
      setTheme('high-contrast');
    }
  };
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript;

      console.log("Heard:", text);

      window.dispatchEvent(
        new CustomEvent("voice-input", {
          detail: text,
        })
      );
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  return (
    <div className="app-container">
      {/* Screen Reader Live Announcements Container */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>

      {/* Accessible Header */}
      <header className="app-header" role="banner">
        <div className="app-header-nav">
          <a
            href="#main-content"
            className="sr-only"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'var(--primary)',
              color: '#fff',
              padding: '10px',
              zIndex: 100
            }}
          >
            Skip to Main Content
          </a>

          <button
            className="app-brand"
            onClick={() => setCurrentPage('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            aria-label="BlindCalc AI Homepage"
          >
            <Calculator aria-hidden="true" size={28} className="app-brand-accent" />
            <span>BlindCalc <span className="app-brand-accent">AI</span></span>
          </button>

          <nav className="nav-links" role="navigation" aria-label="Main Navigation">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
              aria-label="Calculator Workspace"
            >
              Workspace
            </button>
            <button
              className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentPage('about')}
              aria-label="About the Project"
            >
              <Info size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              About
            </button>

            {/* Quick Accessibility Theme Toggles */}
            <div className="theme-toggle-group" style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <button
                className="acc-btn secondary"
                style={{ padding: '0.5rem', minWidth: '40px' }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                className="acc-btn"
                style={{
                  padding: '0.5rem',
                  minWidth: '40px',
                  backgroundColor: theme === 'high-contrast' ? 'var(--text-main)' : 'transparent',
                  color: theme === 'high-contrast' ? 'var(--bg-main)' : 'var(--text-main)',
                  border: '2px solid var(--primary)'
                }}
                onClick={toggleContrast}
                aria-label="Toggle High Contrast Accessibility Mode"
                title="Toggle High Contrast Mode"
              >
                <Eye size={20} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main id="main-content" className="main-content" role="main">
        {children}
      </main>

      {/* Footer detailing Quick Keyboard Commands */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem',
          background: 'rgba(0,0,0,0.1)',
          marginTop: 'auto'
        }}
        role="contentinfo"
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} BlindCalc AI. Created as an accessibility-first tool.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Keyboard size={18} aria-hidden="true" />
            <span aria-label="Keyboard Shortcuts List">
              <strong>Shortcuts:</strong> Alt + R (Record) | Alt + C (High Contrast) | Alt + S (Repeat Last Result)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
