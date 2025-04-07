import React, { useState } from 'react';
import './TrackItem.css';
import SimpleAudioPlayer from './SimpleAudioPlayer';

const TrackItem = ({ track }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Log the track data to debug previewUrl
  console.log('Track data:', track);
  console.log('Preview URL type:', typeof track.previewUrl);
  console.log('Preview URL length:', track.previewUrl ? track.previewUrl.length : 0);
  
  const openInSpotify = (e) => {
    e.stopPropagation();
    window.open(`https://open.spotify.com/track/${track.spotifyId}`, '_blank');
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`track-item ${expanded ? 'expanded' : ''}`} onClick={toggleExpand}>
      <div className="track-content">
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
          
          {expanded && (
            <div className="track-details">
              <div className="track-player-container">
                {/* Use the simplified player component */}
                <SimpleAudioPlayer source={track.previewUrl} />
              </div>
            </div>
          )}
        </div>
        <div className="track-controls">
          <button 
            className="expand-button" 
            onClick={toggleExpand}
            title={expanded ? "Hide details" : "Show details"}
          >
            {expanded ? '▲' : '▼'}
          </button>
          <button 
            className="spotify-button" 
            onClick={openInSpotify}
            title="Open in Spotify"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '4px' }}>
              <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.2.3-.6.4-1 .2-2.8-1.7-6.3-2.1-10.5-1.1-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.5-1 8.4-.6 11.6 1.4.4.2.5.7.2 1zm1.5-3.3c-.3.4-.8.5-1.2.3-3.2-2-8.1-2.6-11.9-1.4-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 4.3-1.3 9.7-.7 13.3 1.7.5.2.6.7.4 1.2zm.1-3.4c-3.8-2.3-10.1-2.5-13.8-1.4-.6.1-1.2-.2-1.3-.8-.1-.6.2-1.2.8-1.3 4.2-1.3 11.1-1 15.5 1.6.5.3.7 1 .4 1.5-.3.5-.9.7-1.6.4z"/>
            </svg>
            Spotify
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackItem; 