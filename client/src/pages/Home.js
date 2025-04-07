import React, { useState } from 'react';
import { useMood } from '../context/MoodContext';
import TrackItem from '../components/TrackItem';

const Home = () => {
  const { analyzeMood, tracks, isLoading, moodText } = useMood();
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    try {
      setError(null);
      const result = await analyzeMood(inputText);
      if (!result) {
        setError('Failed to analyze your mood. Please try again.');
      }
    } catch (err) {
      console.error('Error analyzing mood:', err);
      setError('An error occurred while analyzing your mood. Please try again.');
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Mood Mix</h1>
        <p>Tell us how you're feeling, and we'll create a personalized playlist just for you.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mood-form">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="How are you feeling today? (e.g., I'm feeling happy and energetic!)"
          rows={4}
          className="mood-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`} 
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <span className="loading-spinner">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <style>
                  {`
                    @keyframes rotate {
                      100% { transform: rotate(360deg); }
                    }
                    .spinner {
                      transform-origin: center;
                      animation: rotate 1s linear infinite;
                    }
                  `}
                </style>
                <circle 
                  className="spinner" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeDasharray="30 50" 
                />
              </svg>
              Analyzing...
            </span>
          ) : 'Create Playlist'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {moodText && !isLoading && !error && (
        <div className="results-container">
          <h2>Your Mood Mix</h2>
          <p className="mood-description">Based on your mood: <strong>{moodText}</strong></p>
          
          {tracks.length > 0 ? (
            <div className="tracks-container">
              {tracks.map((track, index) => (
                <TrackItem key={index} track={track} />
              ))}
            </div>
          ) : (
            <div className="no-tracks-message">
              No tracks found for your mood. Please try a different description.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home; 