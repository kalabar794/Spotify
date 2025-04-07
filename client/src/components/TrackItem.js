import React from 'react';
import './TrackItem.css';
import SimpleAudioPlayer from './SimpleAudioPlayer';

const TrackItem = ({ track }) => {
  // Log the track data to debug previewUrl
  console.log('Track data:', track);
  console.log('Preview URL type:', typeof track.previewUrl);
  console.log('Preview URL length:', track.previewUrl ? track.previewUrl.length : 0);
  
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
        
        {/* Use the simplified player component */}
        <SimpleAudioPlayer source={track.previewUrl} />
      </div>
      <div className="track-controls">
        <button className="spotify-button" onClick={openInSpotify}>
          Spotify
        </button>
      </div>
    </div>
  );
};

export default TrackItem; 