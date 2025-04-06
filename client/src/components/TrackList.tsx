import React, { useState, useEffect, useRef } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Paper,
  IconButton,
  Box,
  Collapse,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { PlayArrow, Pause, ExpandMore, ExpandLess, PlaylistAdd, OpenInNew } from '@mui/icons-material';

interface ColorScheme {
  primary: string;
  secondary: string;
  text: string;
}

interface Mood {
  keywords: string[];
  sentiment: number;
  originalText: string;
  colorScheme: ColorScheme;
}

interface Track {
  spotifyId: string;
  name: string;
  artist: string;
  album?: string;
  albumArt?: string;
  previewUrl?: string;
}

interface TrackListProps {
  tracks: Track[];
  mood: Mood | null;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, mood }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Create a new audio element for each playback
  const handlePlay = (track: Track) => {
    // If already playing this track, stop it
    if (playingId === track.spotifyId) {
      // Find and stop any playing audio elements
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.pause();
      });
      setPlayingId(null);
      return;
    }
    
    // If track has preview URL
    if (track.previewUrl) {
      try {
        setIsLoadingAudio(true);
        
        // Create a new audio element for this playback
        const audio = new Audio();
        
        audio.oncanplaythrough = () => {
          setIsLoadingAudio(false);
          setPlayingId(track.spotifyId);
          audio.play().catch(err => {
            console.error("Play error:", err);
            setErrorMessage("Browser couldn't play the audio. Try opening in Spotify.");
            setPlayingId(null);
          });
        };
        
        audio.onerror = () => {
          console.error("Audio load error");
          setIsLoadingAudio(false);
          setErrorMessage("Audio failed to load. Opening in Spotify instead.");
          openInSpotify(track.spotifyId);
        };
        
        audio.onended = () => {
          setPlayingId(null);
        };
        
        // Set source and load
        audio.src = track.previewUrl;
        audio.load();
      } catch (err) {
        console.error("Audio setup error:", err);
        setIsLoadingAudio(false);
        openInSpotify(track.spotifyId);
      }
    } else {
      // No preview URL, open directly in Spotify
      openInSpotify(track.spotifyId);
    }
  };

  const openInSpotify = (spotifyId: string) => {
    const trackId = spotifyId.startsWith('spotify:track:') 
      ? spotifyId.split(':')[2] 
      : spotifyId;
    
    const spotifyLink = `https://open.spotify.com/track/${trackId}`;
    window.open(spotifyLink, '_blank');
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  const displayedTracks = expanded ? tracks : tracks.slice(0, 5);

  return (
    <>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <List sx={{ width: '100%', p: 0 }}>
          {displayedTracks.map((track) => (
            <ListItem
              key={track.spotifyId}
              secondaryAction={
                <Box>
                  <Tooltip title={playingId === track.spotifyId ? "Pause" : (track.previewUrl ? "Play Preview" : "Open in Spotify")}>
                    <IconButton 
                      edge="end" 
                      aria-label="play" 
                      onClick={() => handlePlay(track)}
                      color={playingId === track.spotifyId ? 'primary' : 'default'}
                      sx={{ mr: 1, color: '#1DB954' }}
                      disabled={isLoadingAudio && playingId !== track.spotifyId}
                    >
                      {isLoadingAudio && playingId !== track.spotifyId ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : playingId === track.spotifyId ? (
                        <Pause />
                      ) : (
                        <PlayArrow />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in Spotify">
                    <IconButton 
                      edge="end" 
                      aria-label="open in spotify" 
                      onClick={() => openInSpotify(track.spotifyId)}
                      sx={{ color: '#1DB954' }}
                    >
                      <OpenInNew />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              sx={{ 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                },
                bgcolor: playingId === track.spotifyId ? 
                  (mood ? mood.colorScheme.primary + '10' : 'action.selected') : 
                  'inherit'
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  alt={track.name} 
                  src={track.albumArt} 
                  variant="rounded"
                  sx={{ width: 56, height: 56, mr: 1 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" component="span" fontWeight={500}>
                    {track.name}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span" color="text.secondary">
                      {track.artist}
                    </Typography>
                    <br />
                    <Typography variant="caption" component="span" color="text.secondary">
                      {track.album || ''}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
        
        {tracks.length > 5 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              p: 1, 
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <IconButton
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="show more"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
              <Typography variant="button" sx={{ ml: 1 }}>
                {expanded ? 'Show Less' : `Show ${tracks.length - 5} More Tracks`}
              </Typography>
            </IconButton>
          </Box>
        )}
      </Paper>
      
      <Snackbar 
        open={errorMessage !== null} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="warning" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TrackList; 