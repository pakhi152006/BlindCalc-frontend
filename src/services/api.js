/**
 * BlindCalc AI - API Client
 * Handles communication with local FastAPI server.
 */

const API_BASE = 'https://blindcalc-backend.onrender.com'; // Relies on Vite local proxy to map to http://localhost:8000

export const apiService = {
  /**
   * Submit text-based equation query to backend
   */
  async calculateText(query) {
    try {
      const response = await fetch(`${API_BASE}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Calculation service returned an error.');
      }

      return await response.json();
    } catch (error) {
      console.error('API text calculation error:', error);
      throw error;
    }
  },

  /**
   * Upload voice recording binary to Whisper STT pipeline
   * @param {Blob} audioBlob Audio file containing user voice
   */
  async calculateVoice(audioBlob) {
    try {
      const formData = new FormData();
      // Whisper supports WAV, MP3, WebM, M4A, etc. We name file query.wav
      formData.append('file', audioBlob, 'query.wav');

      const response = await fetch(`${API_BASE}/api/voice-calculate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Voice speech-to-text service failed.');
      }

      return await response.json();
    } catch (error) {
      console.error('API voice calculation error:', error);
      throw error;
    }
  },

  /**
   * Upload voice recording binary to Whisper STT for transcription only
   * @param {Blob} audioBlob Audio file containing user voice
   */
  async transcribeVoice(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'query.wav');

      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Voice speech-to-text service failed.');
      }

      return await response.json();
    } catch (error) {
      console.error('API transcription error:', error);
      throw error;
    }
  },

  /**
   * Fetch calculation logs from database
   */
  async getHistory(searchQuery = '') {
    try {
      const url = searchQuery
        ? `${API_BASE}/api/history?q=${encodeURIComponent(searchQuery)}`
        : `${API_BASE}/api/history`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to retrieve history logs.');
      }

      return await response.json();
    } catch (error) {
      console.error('API history fetch error:', error);
      throw error;
    }
  },

  /**
   * Delete single calculation log
   */
  async deleteHistoryEntry(entryId) {
    try {
      const response = await fetch(`${API_BASE}/api/history/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete history item.');
      }

      return await response.json();
    } catch (error) {
      console.error('API delete history item error:', error);
      throw error;
    }
  },

  /**
   * Clear all history logs
   */
  async clearHistory() {
    try {
      const response = await fetch(`${API_BASE}/api/history`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear database logs.');
      }

      return await response.json();
    } catch (error) {
      console.error('API clear history error:', error);
      throw error;
    }
  },

  /**
   * Builds the URL for backend speech audio files
   */
  getTTSUrl(text) {
    return `${API_BASE}/api/tts?text=${encodeURIComponent(text)}`;
  }
};
