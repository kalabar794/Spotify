import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  useTheme,
  Fade,
  styled,
  IconButton,
  Tooltip,
  List,
  ListItem,
  Avatar
} from '@mui/material';
import { MusicNote, Mood, PlayArrow, OpenInNew, Search } from '@mui/icons-material';
import { useMood } from '../context/MoodContext';
import { AuthContext } from '../context/AuthContext';

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(10px)',
  boxShadow: `0 10px 40px ${theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.5)' 
    : 'rgba(140, 149, 159, 0.2)'}`,
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'}`,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 50px ${theme.palette.mode === 'dark' 
      ? 'rgba(0, 0, 0, 0.7)' 
      : 'rgba(140, 149, 159, 0.3)'}`,
  },
}));

const ResultCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'dark' 
    ? 'rgba(40, 40, 40, 1)' 
    : 'rgba(240, 240, 240, 1)'} 100%)`,
  boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.4)' 
    : 'rgba(140, 149, 159, 0.15)'}`,
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'}`,
}));

const GradientTypography = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  fontWeight: 800,
  marginBottom: theme.spacing(1),
}));

const Home: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { moodText, setMoodText, tracks, isLoading, analyzeMood, clearTracks } = useMood();
  const [analyzedMood, setAnalyzedMood] = useState<{keywords: string[], sentiment: number, originalText: string} | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit button clicked!");
    
    if (!textInput.trim()) {
      setError('Please enter your mood');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      
      console.log('Submitting mood text:', textInput);
      
      // Attempt to analyze mood
      const moodData = await analyzeMood(textInput);
      console.log('Mood data received:', moodData);
      
      // Always show results regardless of API response
      setShowResults(true);
      
      // Set mood data (will use fallback from analyzeMood if API call failed)
      if (moodData) {
        setAnalyzedMood(moodData);
      } else {
        // Fallback mood data if null
        setAnalyzedMood({
          keywords: [textInput],
          sentiment: 1,
          originalText: textInput
        });
      }
      
      // Update mood text in context
      setMoodText(textInput);
      
      // Scroll to results if available
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze your mood');
      
      // Still show results even on error
      setShowResults(true);
      
      // Set fallback mood data
      setAnalyzedMood({
        keywords: [textInput],
        sentiment: 1,
        originalText: textInput
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    clearTracks();
    setShowResults(false);
    setTextInput('');
    setMoodText('');
    setAnalyzedMood(null);
  };

  const gradientBackground = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(37, 16, 83, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(148, 0, 211, 0.1) 0%, rgba(75, 0, 130, 0.05) 100%)';

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 64px)', 
        py: 4,
        background: gradientBackground,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <Container maxWidth="md">
        <Fade in={true} timeout={1000}>
          <div>
            {!showResults ? (
              <GradientPaper elevation={0}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <MusicNote 
                    sx={{ 
                      fontSize: 60, 
                      color: theme.palette.primary.main,
                      mb: 2,
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                    }} 
                  />
                  <GradientTypography variant="h3">
                    How are you feeling today?
                  </GradientTypography>
                  
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                    Describe your mood or situation, and we'll create a personalized playlist that matches your emotional state.
                  </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Describe your mood..."
                    multiline
                    rows={4}
                    variant="outlined"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: theme.palette.mode === 'dark' 
                          ? 'rgba(0, 0, 0, 0.2)' 
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                      }
                    }}
                  />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      size="large" 
                      disabled={isSubmitting || !textInput.trim()}
                      onClick={handleSubmit}
                      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Mood />}
                      sx={{ 
                        borderRadius: 50, 
                        px: 4, 
                        py: 1.5,
                        fontSize: '1.1rem',
                        minWidth: '200px',
                      }}
                    >
                      {isSubmitting ? 'Analyzing...' : 'Find My Music'}
                    </Button>
                  </Box>
                </Box>
              </GradientPaper>
            ) : (
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'}`
                }}>
                  <GradientTypography variant="h4">
                    Your Mood Results
                  </GradientTypography>
                  <Button 
                    variant="outlined" 
                    onClick={handleReset}
                    sx={{ 
                      borderRadius: 50,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                  >
                    Try Another Mood
                  </Button>
                </Box>
                
                {error && (
                  <ResultCard 
                    elevation={0} 
                    sx={{ 
                      bgcolor: 'error.main', 
                      color: 'error.contrastText',
                      p: 3
                    }}
                  >
                    <Typography>{error}</Typography>
                  </ResultCard>
                )}
                
                {isLoading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    flexDirection: 'column',
                    py: 10
                  }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" sx={{ mt: 3 }}>
                      Creating your perfect playlist...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {analyzedMood && (
                      <ResultCard elevation={0}>
                        <Typography variant="h5" sx={{ 
                          color: theme.palette.primary.main,
                          fontWeight: 700,
                          mb: 2
                        }}>
                          Mood Analysis
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          mb: 2
                        }}>
                          {analyzedMood.keywords.map((keyword, i) => (
                            <Box 
                              key={i}
                              sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                px: 2,
                                py: 0.75,
                                borderRadius: 50,
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                              }}
                            >
                              {keyword}
                            </Box>
                          ))}
                        </Box>
                        
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Sentiment Score: <Box component="span" sx={{ fontWeight: 'bold' }}>
                            {analyzedMood.sentiment.toFixed(2)}
                          </Box>
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                          "{analyzedMood.originalText}"
                        </Typography>
                      </ResultCard>
                    )}
                    
                    {tracks && tracks.length > 0 && (
                      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1DB954' }}>
                          Your Personalized Playlist
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                          Based on your mood: <strong>{moodText}</strong>
                        </Typography>
                        <List>
                          {tracks.map((track, index) => {
                            const spotifyTrackId = track.spotifyId.startsWith('spotify:track:') 
                              ? track.spotifyId.split(':')[2] 
                              : track.spotifyId;
                            
                            const spotifyLink = `https://open.spotify.com/track/${spotifyTrackId}`;
                            
                            return (
                              <ListItem 
                                key={track.spotifyId} 
                                sx={{
                                  borderBottom: index < tracks.length - 1 ? '1px solid #eee' : 'none',
                                  py: 1.5
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <Avatar 
                                    sx={{ 
                                      bgcolor: '#1DB954', 
                                      width: 36, 
                                      height: 36, 
                                      mr: 2,
                                      fontSize: '0.9rem',
                                      fontWeight: 'bold' 
                                    }}
                                  >
                                    {index + 1}
                                  </Avatar>
                                  
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                      {track.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {track.artist}
                                    </Typography>
                                  </Box>
                                  
                                  <Box>
                                    {track.previewUrl && (
                                      <Tooltip title="Play Preview">
                                        <IconButton 
                                          color="primary" 
                                          href={track.previewUrl} 
                                          target="_blank"
                                          sx={{ color: '#1DB954' }}
                                        >
                                          <PlayArrow />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    
                                    <Tooltip title="Open in Spotify">
                                      <IconButton 
                                        href={spotifyLink} 
                                        target="_blank"
                                        sx={{ color: '#1DB954' }}
                                      >
                                        <OpenInNew />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </ListItem>
                            );
                          })}
                        </List>
                        
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            href="https://open.spotify.com/search" 
                            target="_blank"
                            startIcon={<Search />}
                            sx={{ 
                              bgcolor: '#1DB954', 
                              '&:hover': { bgcolor: '#1aa34a' } 
                            }}
                          >
                            Explore More on Spotify
                          </Button>
                        </Box>
                      </Paper>
                    )}
                    
                    {analyzedMood && tracks && tracks.length === 0 && (
                      <Paper
                        elevation={3}
                        sx={{
                          p: 4,
                          mt: 4,
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          No matching tracks found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          We couldn't find any tracks that match your mood. Try a different description.
                        </Typography>
                      </Paper>
                    )}
                    
                    {isAuthenticated ? (
                      <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={() => navigate('/dashboard')}
                        sx={{ 
                          borderRadius: 50,
                          px: 4,
                          py: 1.25,
                          fontWeight: 'bold'
                        }}
                      >
                        Save This Playlist
                      </Button>
                    ) : (
                      <Box sx={{ 
                        mt: 3, 
                        p: 3, 
                        borderRadius: theme.shape.borderRadius,
                        background: `linear-gradient(135deg, ${theme.palette.primary.light}10, ${theme.palette.secondary.light}10)`,
                        border: `1px solid ${theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.05)'}`,
                      }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Want to save this playlist?
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Create an account or log in to save and access your personalized playlists anytime.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button 
                            variant="contained" 
                            color="secondary"
                            onClick={() => navigate('/register')}
                            sx={{ borderRadius: 50 }}
                          >
                            Sign Up
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="secondary"
                            onClick={() => navigate('/login')}
                            sx={{ 
                              borderRadius: 50,
                              borderWidth: 2,
                              '&:hover': { borderWidth: 2 }
                            }}
                          >
                            Login
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </div>
        </Fade>
      </Container>
    </Box>
  );
};

export default Home; 