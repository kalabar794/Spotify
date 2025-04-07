import React, { useState } from 'react';
import { useMood } from '../context/MoodContext';
import TrackItem from '../components/TrackItem';

const Home = () => {
  const { analyzeMood, tracks, isLoading, moodText } = useMood();
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      analyzeMood(inputText);
    }
  };

  return (
    <div className="home-container">
      <h1>Mood Mix</h1>
      <p>Tell us how you're feeling, and we'll create a personalized playlist just for you.</p>
      
      <form onSubmit={handleSubmit} className="mood-form">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="How are you feeling today? (e.g., I'm feeling happy and energetic!)"
          rows={4}
          className="mood-input"
        />
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Create Playlist'}
        </button>
      </form>

      {moodText && !isLoading && (
        <div className="results-container">
          <h2>Your Mood Mix</h2>
          <p className="mood-description">Based on your mood: <strong>{moodText}</strong></p>
          
          <div className="tracks-container">
            {tracks.map((track, index) => (
              <TrackItem key={index} track={track} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 