import React, { useState } from 'react';
import './TrackItem.css';

const TrackItem = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(track.previewUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error("Audio playback failed");
        setIsPlaying(false);
        // Open in Spotify as fallback
        window.open(`https://open.spotify.com/track/${track.spotifyId}`, '_blank');
      };
      audio.play().catch(err => {
        console.error("Play error:", err);
        // Open in Spotify as fallback
        window.open(`https://open.spotify.com/track/${track.spotifyId}`, '_blank');
      });
      setAudioElement(audio);
      setIsPlaying(true);
    }
  };

  const openInSpotify = (e) => {
    e.stopPropagation();
    window.open(`https://open.spotify.com/track/${track.spotifyId}`, '_blank');
  };

  return (
    <div className="track-item" onClick={togglePlay}>
      <img 
        src={track.albumArt || 'https://via.placeholder.com/80'} 
        alt={track.name} 
        className="track-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/80';
        }}
      />
      <div className="track-info">
        <div className="track-name">{track.name}</div>
        <div className="track-artist">{track.artist}</div>
        <div className="track-album">{track.album}</div>
      </div>
      <div className="track-controls">
        <button className={`play-button ${isPlaying ? 'playing' : ''}`}>
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button className="spotify-button" onClick={openInSpotify}>
          Spotify
        </button>
      </div>
    </div>
  );
};

export default TrackItem; 