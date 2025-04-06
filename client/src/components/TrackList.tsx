import React, { useState, useEffect } from 'react';
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
  Alert
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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  const handlePlay = (track: Track) => {
    // Stop currently playing audio
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    // If the same track is clicked, stop it
    if (playingId === track.spotifyId) {
      setPlayingId(null);
      setAudio(null);
      return;
    }
    
    // If the track has a preview URL, play it
    if (track.previewUrl) {
      const newAudio = new Audio();
      
      // Set up event listeners before setting src to avoid race conditions
      newAudio.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        setErrorMessage(`Couldn't play track: ${track.name}. Opening in Spotify instead.`);
        setPlayingId(null);
        // Fall back to opening in Spotify
        setTimeout(() => openInSpotify(track.spotifyId), 1500);
      });
      
      newAudio.addEventListener('ended', () => {
        setPlayingId(null);
      });

      // Load and play audio
      newAudio.src = track.previewUrl;
      
      // Use the play promise to handle autoplay restrictions
      newAudio.play()
        .then(() => {
          setAudio(newAudio);
          setPlayingId(track.spotifyId);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          if (err.name === 'NotAllowedError') {
            setErrorMessage("Autoplay blocked by browser. Please interact with the page first.");
          } else {
            setErrorMessage(`Couldn't play preview for: ${track.name}. Try opening in Spotify.`);
          }
        });
    } else {
      // If no preview URL available, open in Spotify directly
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
                  <Tooltip title={playingId === track.spotifyId ? "Pause" : (track.previewUrl ? "Play Preview" : "Play on Spotify")}>
                    <IconButton 
                      edge="end" 
                      aria-label="play" 
                      onClick={() => handlePlay(track)}
                      color={playingId === track.spotifyId ? 'primary' : 'default'}
                      sx={{ mr: 1, color: '#1DB954' }}
                    >
                      {playingId === track.spotifyId ? <Pause /> : <PlayArrow />}
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