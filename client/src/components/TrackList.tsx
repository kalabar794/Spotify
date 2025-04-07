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
  CircularProgress,
  Button
} from '@mui/material';
import { PlayArrow, Pause, ExpandMore, ExpandLess, PlaylistAdd, OpenInNew } from '@mui/icons-material';
import AudioPlayer from './AudioPlayer';

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
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Initialize audio context on component mount
  useEffect(() => {
    // Create AudioContext but don't start it yet
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    
    return () => {
      // Clean up on unmount
      if (context && context.state !== 'closed') {
        context.close();
      }
    };
  }, []);
  
  // Function to resume audio context (must be called from a user action)
  const resumeAudioContext = () => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('AudioContext successfully resumed');
      }).catch(err => {
        console.error('Failed to resume AudioContext:', err);
      });
    }
  };
  
  // Create a new audio element for each playback
  const handlePlay = (track: Track) => {
    // Ensure audio context is resumed (must happen from user interaction)
    resumeAudioContext();
    
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
        
        // Only use proxy for non-data URLs, prefer direct data URLs first
        let audioUrl = track.previewUrl;
        if (!audioUrl.startsWith('data:')) {
          console.log(`Using external URL: ${audioUrl}`);
          // Only use the proxy as a fallback, not as the primary method
          // since we're now using embedded audio data
        }
        
        audio.oncanplaythrough = () => {
          setIsLoadingAudio(false);
          setPlayingId(track.spotifyId);
          audio.play().catch(err => {
            console.error("Play error:", err);
            setErrorMessage("Browser couldn't play the audio. Try opening in Spotify.");
            setPlayingId(null);
          });
        };
        
        audio.onerror = (e) => {
          console.error("Audio load error");
          setIsLoadingAudio(false);
          
          // If error is with a non-data URL, try the proxy
          if (!audioUrl.startsWith('data:') && !audioUrl.includes('/api/preview-proxy')) {
            console.log("Trying proxy instead");
            // Add a check for undefined previewUrl
            if (track.previewUrl) {
              audio.src = `/api/preview-proxy?url=${encodeURIComponent(track.previewUrl)}`;
              audio.load();
              return; // Don't show error yet, try proxy first
            }
          }
          
          setErrorMessage("Audio failed to load. Opening in Spotify instead.");
          openInSpotify(track.spotifyId);
        };
        
        audio.onended = () => {
          setPlayingId(null);
        };
        
        // Set source and load
        audio.src = audioUrl;
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
  
  // Add a test sound function
  const testAudio = () => {
    resumeAudioContext();
    const testSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAFwAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/////////////////////////////////+M4wDv/i5rCEQcAANBuKK3XdujQfBuGIYhicIQeD4cHnMYIN4PggwcH8Hw4ggwfBA/BAEHAIHg+CDHiCIYfQQYPggaDgiCB/4PgQCD4Ig+CIOAQPh8QfAkHwQY8fB5w4IPggCEAwIAOgAwAAwBuBgYLgjgAIAAAAACsAAADgAA/8YAAAONiZCXjYAAAAMAAAMAADA4CAgGAAAEAAAOAB+JZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAE5pbXBvcnRlZCBmcm9tIGlDb3JlLg==");
    
    testSound.oncanplaythrough = () => {
      testSound.play().catch(e => {
        console.error("Test sound failed:", e);
        setErrorMessage("Test sound couldn't play. Check your browser permissions.");
      });
    };
    
    testSound.onerror = () => {
      console.error("Test sound load error");
      setErrorMessage("Test sound failed to load.");
    };
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
    <Box sx={{ width: '100%', mt: 3 }}>
      {/* Track list header with mood title */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ 
          fontWeight: 700,
          fontSize: { xs: '1.5rem', md: '1.8rem' },
          mb: 0
        }}>
          {mood ? `${mood.originalText ? mood.originalText.charAt(0).toUpperCase() + mood.originalText.slice(1) : 'Your'} Tracks` : 'Your Recommended Tracks'}
        </Typography>
        
        {/* Add test sound button */}
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={testAudio}
          size="small"
          sx={{ borderRadius: 50 }}
        >
          Test Audio
        </Button>
      </Box>
      
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <List sx={{ width: '100%', p: 0 }}>
          {displayedTracks.map((track) => (
            <ListItem
              key={track.spotifyId}
              secondaryAction={
                <Box>
                  <Box onClick={resumeAudioContext} sx={{ display: 'inline-block' }}>
                    <AudioPlayer previewUrl={track.previewUrl} />
                  </Box>
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
                  imgProps={{
                    onError: (e) => {
                      // @ts-ignore - TypeScript doesn't know about currentTarget.src
                      e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231DB954"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
                      console.log('Album image failed to load, using fallback data URI');
                    }
                  }}
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
    </Box>
  );
};

export default TrackList; 