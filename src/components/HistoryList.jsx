import React, { useState, useEffect } from 'react';
import { Play, Trash2, Search, History, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const HistoryList = ({ 
  speakText, 
  historyTrigger, 
  setHistoryTrigger,
  makeAnnouncement
}) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch history when trigger changes or search query changes
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getHistory(searchQuery);
        setHistoryItems(data);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve logs from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [historyTrigger, searchQuery]);

  const handleDelete = async (id, query) => {
    try {
      await apiService.deleteHistoryEntry(id);
      makeAnnouncement(`Deleted calculation for ${query}`);
      setHistoryTrigger(prev => prev + 1); // refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to delete history item.');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all calculation history? This cannot be undone.')) {
      try {
        await apiService.clearHistory();
        makeAnnouncement("All calculation logs successfully wiped from the database.");
        setHistoryTrigger(prev => prev + 1);
      } catch (err) {
        console.error(err);
        alert('Failed to clear history.');
      }
    }
  };

  const replayAnswer = (item) => {
    const speechText = `${item.query} equals ${item.result_spoken}`;
    speakText(speechText);
    makeAnnouncement(`Replaying: ${item.query}`);
  };

  return (
    <section className="glass-card" aria-labelledby="history-title" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={24} className="app-brand-accent" aria-hidden="true" />
          <h2 id="history-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem' }}>
            Calculation History
          </h2>
        </div>
        
        {historyItems.length > 0 && (
          <button 
            className="acc-btn" 
            style={{ backgroundColor: 'var(--danger)' }} 
            onClick={handleClearAll}
            aria-label="Wipe and clear all calculations from database"
          >
            <Trash2 size={16} /> Clear All History
          </button>
        )}
      </div>

      {/* Accessible Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <label htmlFor="history-search" className="sr-only">Search calculations logs</label>
        <input
          id="history-search"
          type="text"
          className="acc-input"
          placeholder="Search queries, intents, or results..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '3rem' }}
          aria-label="Search previous calculations"
        />
        <Search 
          size={20} 
          style={{ 
            position: 'absolute', 
            left: '1.25rem', 
            top: '55%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-muted)' 
          }} 
          aria-hidden="true" 
        />
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Updating logs...</p>}
      
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', margin: '1rem 0' }}>
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {!loading && historyItems.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          {searchQuery ? "No matching calculations found." : "No calculations in history logs. Speak a formula to begin!"}
        </p>
      )}

      {/* History Lists */}
      <div className="history-list" role="feed" aria-label="Past calculations list">
        {historyItems.map((item, index) => (
          <article 
            key={item.id || index} 
            className="history-item" 
            role="article" 
            aria-label={`Calculation ${index + 1}: ${item.query}`}
          >
            <div className="history-item-details">
              <div className="history-item-query">{item.query}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Intent: <span style={{ textTransform: 'capitalize', color: 'var(--text-main)', fontWeight: '600' }}>{item.intent}</span>
              </div>
              <div className="history-item-result">
                {item.result_text}
              </div>
              {item.result_latex && (
                <div 
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0', fontFamily: 'monospace' }}
                  aria-hidden="true"
                >
                  LaTeX: {item.result_latex}
                </div>
              )}
            </div>

            <div className="history-actions">
              <button
                className="acc-btn secondary"
                style={{ padding: '0.5rem', borderRadius: '50%', minWidth: '40px', height: '40px' }}
                onClick={() => replayAnswer(item)}
                title="Replay this calculation's spoken answer"
                aria-label={`Replay spoken answer for ${item.query}`}
              >
                <Play size={16} fill="currentColor" />
              </button>
              
              <button
                className="acc-btn secondary"
                style={{ padding: '0.5rem', borderRadius: '50%', minWidth: '40px', height: '40px', border: '1px solid var(--danger)' }}
                onClick={() => handleDelete(item.id, item.query)}
                title="Delete this calculation record"
                aria-label={`Delete calculation record: ${item.query}`}
              >
                <Trash2 size={16} style={{ color: 'var(--danger)' }} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
