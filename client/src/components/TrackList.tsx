import React, { useState } from 'react';
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
  Tooltip
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
      const newAudio = new Audio(track.previewUrl);
      newAudio.play();
      newAudio.addEventListener('ended', () => {
        setPlayingId(null);
      });
      
      setAudio(newAudio);
      setPlayingId(track.spotifyId);
    }
  };

  const openInSpotify = (spotifyId: string) => {
    const trackId = spotifyId.startsWith('spotify:track:') 
      ? spotifyId.split(':')[2] 
      : spotifyId;
    
    const spotifyLink = `https://open.spotify.com/track/${trackId}`;
    window.open(spotifyLink, '_blank');
  };

  const displayedTracks = expanded ? tracks : tracks.slice(0, 5);

  return (
    <Paper elevation={3} sx={{ borderRadius: 2 }}>
      <List sx={{ width: '100%', p: 0 }}>
        {displayedTracks.map((track) => (
          <ListItem
            key={track.spotifyId}
            secondaryAction={
              <Box>
                <Tooltip title={playingId === track.spotifyId ? "Pause" : "Play Preview"}>
                  <IconButton 
                    edge="end" 
                    aria-label="play" 
                    onClick={() => handlePlay(track)}
                    disabled={!track.previewUrl}
                    color={playingId === track.spotifyId ? 'primary' : 'default'}
                    sx={{ mr: 1 }}
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
  );
};

export default TrackList; 