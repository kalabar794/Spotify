import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import TrackList from '../components/TrackList';
import TrackItem from '../components/TrackItem';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isAuthenticated } = useContext(AuthContext);

  // Animation for background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Music note particle system
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
    }[] = [];

    // Create initial particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 20 + 10,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2 - 1, // Bias upward
        opacity: Math.random() * 0.7 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    // Handle window resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    // Draw music note
    const drawMusicNote = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      
      // Draw note head
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#a06cd5';
      ctx.fill();
      
      // Draw stem
      ctx.beginPath();
      ctx.moveTo(size * 0.5, 0);
      ctx.lineTo(size * 0.5, -size * 1.5);
      ctx.lineWidth = size * 0.15;
      ctx.strokeStyle = '#a06cd5';
      ctx.stroke();
      
      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach(particle => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;
        
        // Reset if off-screen
        if (particle.y < -100 || particle.y > height + 100 || 
            particle.x < -100 || particle.x > width + 100) {
          particle.x = Math.random() * width;
          particle.y = height + 50;
          particle.speedY = -Math.random() * 2 - 1;
        }
        
        // Draw the particle
        drawMusicNote(
          particle.x, 
          particle.y, 
          particle.size, 
          particle.rotation, 
          particle.opacity
        );
      });
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Check for mood parameter in the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const moodParam = searchParams.get('mood');
    
    if (moodParam) {
      setTextInput(moodParam);
      // Optionally auto-submit the form
      const submitForm = async () => {
        try {
          setError(null);
          setIsSubmitting(true);
          
          // Attempt to analyze mood
          const moodData = await analyzeMood(moodParam);
          
          // Show results
          setShowResults(true);
          
          // Set mood data
          if (moodData) {
            setAnalyzedMood(moodData);
          } else {
            // Fallback mood data if null
            setAnalyzedMood({
              keywords: [moodParam],
              sentiment: 1,
              originalText: moodParam
            });
          }
          
          // Update mood text in context
          setMoodText(moodParam);
          
          // Clear URL parameter
          navigate('/home', { replace: true });
          
          // Scroll to results
          setTimeout(() => {
            if (resultsRef.current) {
              resultsRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        } catch (err) {
          console.error('Error in auto-submit:', err);
          setError(err instanceof Error ? err.message : 'Failed to analyze your mood');
          setShowResults(true);
          setAnalyzedMood({
            keywords: [moodParam],
            sentiment: 1,
            originalText: moodParam
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      submitForm();
    }
  }, [location.search, analyzeMood, navigate, setMoodText]);

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
        position: 'relative',
        minHeight: 'calc(100vh - 80px)', 
        py: 4,
        background: 'linear-gradient(135deg, #6247aa, #a06cd5, #7076e2)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        overflow: 'hidden'
      }}
    >
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={1000}>
          <div>
            {!showResults ? (
              <GradientPaper elevation={0} sx={{ 
                position: 'relative',
                animation: 'fadeIn 1.2s',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <MusicNote 
                    sx={{ 
                      fontSize: 60, 
                      color: theme.palette.primary.main,
                      mb: 2,
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
                      animation: 'float 3s infinite ease-in-out',
                      '@keyframes float': {
                        '0%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-10px)' },
                        '100%': { transform: 'translateY(0px)' }
                      }
                    }} 
                  />
                  <GradientTypography variant="h3" sx={{
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }}>
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
                      <ResultCard elevation={0} sx={{
                        animation: 'slideUp 0.8s ease-out',
                        '@keyframes slideUp': {
                          '0%': { transform: 'translateY(30px)', opacity: 0 },
                          '100%': { transform: 'translateY(0)', opacity: 1 }
                        }
                      }}>
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
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                animation: `fadeInKeyword 0.5s ease-out ${0.1 * i}s both`,
                                '@keyframes fadeInKeyword': {
                                  '0%': { transform: 'scale(0.8)', opacity: 0 },
                                  '100%': { transform: 'scale(1)', opacity: 1 }
                                }
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
                        
                        <TrackList tracks={tracks} mood={analyzedMood ? {
                          keywords: analyzedMood.keywords,
                          sentiment: analyzedMood.sentiment,
                          originalText: analyzedMood.originalText,
                          colorScheme: {
                            primary: theme.palette.primary.main,
                            secondary: theme.palette.secondary.main,
                            text: theme.palette.text.primary
                          }
                        } : null} />
                        
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Want to try another view?
                          </Typography>
                          <Button 
                            variant="outlined"
                            sx={{ mt: 1 }}
                            onClick={() => {
                              // Open a dialog or toggle visibility of alternative view
                              // For simplicity, we'll just show an alert
                              alert("Alternative track view can be implemented using the TrackItem component");
                            }}
                          >
                            Alternative View
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
                        p: 0,  // Removing padding to make this component invisible
                        display: 'none', // Hide this component completely
                      }}>
                        {/* Section removed as requested */}
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