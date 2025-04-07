import React, { useState, useRef, useEffect } from 'react';
import './TrackItem.css';

const TrackItem = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);
  
  // Handle image loading errors
  const handleImageError = (e) => {
    // Use a data URI as fallback since we couldn't download the placeholder
    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231DB954"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
    console.log('Album image failed to load, using fallback data URI');
  };
  
  // Clean up function for audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  const togglePlay = () => {
    if (!track.previewUrl) {
      console.error('No preview URL available for:', track.name);
      return;
    }
    
    if (!audioRef.current) {
      // Create a proxy URL to avoid CORS issues
      const proxyUrl = track.previewUrl?.startsWith('http') 
        ? `/api/preview-proxy?url=${encodeURIComponent(track.previewUrl)}`
        : track.previewUrl;
      
      audioRef.current = new Audio(proxyUrl);
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setHasError(true);
        setIsPlaying(false);
      });
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset error state on new play attempt
      setHasError(false);
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Playback failed:', err);
          setHasError(true);
        });
    }
  };
  
  const openInSpotify = () => {
    const trackId = track.spotifyId.startsWith('spotify:track:') 
      ? track.spotifyId.split(':')[2] 
      : track.spotifyId;
    
    const spotifyLink = `https://open.spotify.com/track/${trackId}`;
    window.open(spotifyLink, '_blank');
  };
  
  return (
    <div className="track-item">
      <img 
        src={track.albumArt} 
        alt={`${track.album || track.name} cover`} 
        onError={handleImageError} 
        className="album-art"
      />
      
      <div className="track-info">
        <h3>{track.name}</h3>
        <p>{track.artist}</p>
        <p className="album-name">{track.album}</p>
      </div>
      
      <div className="track-controls">
        <button 
          onClick={togglePlay} 
          disabled={!track.previewUrl || hasError}
          className={`play-button ${isPlaying ? 'playing' : ''} ${hasError ? 'error' : ''}`}
          title={!track.previewUrl ? 'No Preview Available' : 
                hasError ? 'Error Playing Preview' : 
                isPlaying ? 'Pause' : 'Play Preview'}
        >
          {!track.previewUrl ? 'No Preview' : 
            hasError ? 'Error' : 
            isPlaying ? '■' : '▶'}
        </button>
        
        <button 
          onClick={openInSpotify}
          className="spotify-button"
          title="Open in Spotify"
        >
          Open in Spotify
        </button>
      </div>
    </div>
  );
};

export default TrackItem; 