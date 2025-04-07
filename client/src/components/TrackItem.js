import React, { useState, useRef } from 'react';
import './TrackItem.css';

const TrackItem = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    // If already playing, pause it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Reset error state on new play attempt
    setAudioError(false);

    try {
      // Create new audio element if we don't have one
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      // Set up event handlers
      audioRef.current.onended = () => {
        console.log("Audio playback ended");
        setIsPlaying(false);
      };

      audioRef.current.oncanplaythrough = () => {
        console.log("Audio can play through");
        // Only start playing when it's ready
        audioRef.current.play()
          .then(() => {
            console.log("Audio playing successfully");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Audio play failed:", err);
            setAudioError(true);
          });
      };

      audioRef.current.onerror = (e) => {
        console.error("Audio error:", e);
        setAudioError(true);
        setIsPlaying(false);
      };

      // Set the source
      console.log("Setting audio source:", track.previewUrl);
      audioRef.current.src = track.previewUrl;
      audioRef.current.load();
    } catch (err) {
      console.error("Audio setup error:", err);
      setAudioError(true);
    }
  };

  const openInSpotify = (e) => {
    e.stopPropagation();
    window.open(`https://open.spotify.com/track/${track.spotifyId}`, '_blank');
  };

  return (
    <div className="track-item">
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
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''} ${audioError ? 'error' : ''}`}
          onClick={togglePlay}
          title={audioError ? "Error playing audio" : isPlaying ? "Pause" : "Play"}
        >
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