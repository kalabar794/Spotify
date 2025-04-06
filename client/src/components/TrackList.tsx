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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  // Create a persistent audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create the audio element once
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Add global event listeners
      audioRef.current.addEventListener('ended', () => {
        setPlayingId(null);
        setIsLoadingAudio(false);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        setErrorMessage("Couldn't play audio. There may be an issue with the track or your browser settings.");
        setPlayingId(null);
        setIsLoadingAudio(false);
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handlePlay = (track: Track) => {
    // If we're already playing this track, stop it
    if (playingId === track.spotifyId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    
    // If the track has a preview URL, play it
    if (track.previewUrl) {
      setIsLoadingAudio(true);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        
        // Set up event for this specific track
        audioRef.current.oncanplaythrough = () => {
          setIsLoadingAudio(false);
          if (audioRef.current) {
            audioRef.current.play()
              .then(() => {
                setPlayingId(track.spotifyId);
              })
              .catch(err => {
                console.error("Error playing audio:", err);
                setIsLoadingAudio(false);
                
                if (err.name === 'NotAllowedError') {
                  setErrorMessage("Browser blocked autoplay. Please click the play button again.");
                } else {
                  setErrorMessage(`Couldn't play preview. Try opening in Spotify instead.`);
                }
              });
          }
        };
        
        // Set the source and load the audio
        audioRef.current.src = track.previewUrl;
        audioRef.current.load();
      }
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