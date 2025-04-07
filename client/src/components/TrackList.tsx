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
                  <AudioPlayer previewUrl={track.previewUrl} />
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
    </>
  );
};

export default TrackList; 