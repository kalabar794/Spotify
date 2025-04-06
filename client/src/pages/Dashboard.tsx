import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert,
  CircularProgress,
  Fade,
  Button,
  Divider,
  useTheme,
  styled,
  Card,
  CardContent,
  Zoom,
} from '@mui/material';
import { 
  LibraryMusic, 
  MusicNote, 
  Person,
  PlaylistAdd,
  TimelineOutlined
} from '@mui/icons-material';
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
  marginBottom: theme.spacing(3),
  overflow: 'hidden',
  position: 'relative',
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

const CircleDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '250px',
  height: '250px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}30)`,
  right: '-80px',
  top: '-80px',
  zIndex: 0,
}));

const Dashboard: React.FC = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('playlists');

  // Mock data for demo purposes
  const mockPlaylists = [
    { id: 1, name: "Energetic Morning", tracks: 12, mood: "Upbeat & Energetic", createdAt: "2023-05-15" },
    { id: 2, name: "Calm Evening", tracks: 8, mood: "Relaxed & Peaceful", createdAt: "2023-05-10" },
    { id: 3, name: "Focus Time", tracks: 10, mood: "Concentrated & Focused", createdAt: "2023-05-05" },
  ];

  const mockAnalysis = [
    { id: 1, text: "Feeling energetic and ready to take on the day", sentiment: 0.8, date: "2023-05-15" },
    { id: 2, text: "Need to relax after a stressful day at work", sentiment: 0.3, date: "2023-05-10" },
    { id: 3, text: "Looking for music that helps me concentrate", sentiment: 0.6, date: "2023-05-05" },
  ];

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading your dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const gradientBackground = theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(37, 16, 83, 0.8) 100%)'
    : 'linear-gradient(135deg, rgba(148, 0, 211, 0.05) 0%, rgba(75, 0, 130, 0.02) 100%)';

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
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <div>
            <GradientPaper elevation={0}>
              <CircleDecoration />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ 
                    fontSize: 40, 
                    mr: 2,
                    color: theme.palette.primary.main,
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                  }} />
                  <Box>
                    <GradientTypography variant="h4">
                      Welcome, {user?.username || 'User'}!
                    </GradientTypography>
                    <Typography variant="body1" color="text.secondary">
                      This is your personal music dashboard
                    </Typography>
                  </Box>
                </Box>
                
                <Typography paragraph sx={{ maxWidth: '70%' }}>
                  Manage your saved playlists, view your mood history, and get personalized music recommendations based on your previous moods.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 3,
                  borderBottom: 1,
                  borderColor: 'divider',
                  pb: 1
                }}>
                  <Button 
                    startIcon={<LibraryMusic />}
                    onClick={() => setActiveTab('playlists')}
                    sx={{ 
                      borderRadius: 50,
                      px: 3,
                      background: activeTab === 'playlists' 
                        ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                        : 'transparent',
                      color: activeTab === 'playlists' ? 'white' : 'text.primary',
                      '&:hover': {
                        background: activeTab === 'playlists' 
                          ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                          : 'rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    My Playlists
                  </Button>
                  
                  <Button 
                    startIcon={<TimelineOutlined />}
                    onClick={() => setActiveTab('analysis')}
                    sx={{ 
                      borderRadius: 50,
                      px: 3,
                      background: activeTab === 'analysis' 
                        ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                        : 'transparent',
                      color: activeTab === 'analysis' ? 'white' : 'text.primary',
                      '&:hover': {
                        background: activeTab === 'analysis' 
                          ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
                          : 'rgba(0, 0, 0, 0.05)'
                      }
                    }}
                  >
                    Mood History
                  </Button>
                </Box>
              </Box>
            </GradientPaper>
            
            {activeTab === 'playlists' && (
              <Fade in={true} timeout={500}>
                <div>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Your Saved Playlists
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<PlaylistAdd />}
                      sx={{ 
                        borderRadius: 50,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        px: 3,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        }
                      }}
                    >
                      Create New
                    </Button>
                  </Box>
                  
                  {mockPlaylists.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {mockPlaylists.map((playlist, index) => (
                        <Box key={playlist.id} sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                            <Card sx={{ 
                              height: '100%',
                              borderRadius: theme.shape.borderRadius,
                              background: theme.palette.mode === 'dark' 
                                ? 'rgba(30, 30, 40, 0.6)'
                                : 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                              }
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Box sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '50%',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    mr: 2
                                  }}>
                                    <MusicNote sx={{ color: 'white' }} />
                                  </Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {playlist.name}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Mood:</strong> {playlist.mood}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Tracks:</strong> {playlist.tracks}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Created:</strong> {playlist.createdAt}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                  <Button 
                                    variant="contained" 
                                    size="small"
                                    sx={{ 
                                      borderRadius: 50,
                                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                      flexGrow: 1,
                                      '&:hover': {
                                        background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                                      }
                                    }}
                                  >
                                    Play
                                  </Button>
                                  <Button 
                                    variant="outlined" 
                                    size="small"
                                    sx={{ 
                                      borderRadius: 50,
                                      borderColor: theme.palette.primary.main,
                                      flexGrow: 1
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </Zoom>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <GradientPaper elevation={0} sx={{ textAlign: 'center', py: 5 }}>
                      <LibraryMusic sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No saved playlists yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create playlists from your mood analysis results to see them here
                      </Typography>
                      <Button 
                        variant="contained"
                        sx={{ 
                          borderRadius: 50,
                          px: 3,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                          }
                        }}
                      >
                        Create Your First Playlist
                      </Button>
                    </GradientPaper>
                  )}
                </div>
              </Fade>
            )}
            
            {activeTab === 'analysis' && (
              <Fade in={true} timeout={500}>
                <div>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Your Mood History
                  </Typography>
                  
                  {mockAnalysis.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {mockAnalysis.map((analysis, index) => (
                        <Box key={analysis.id}>
                          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                            <Card sx={{ 
                              borderRadius: theme.shape.borderRadius,
                              background: theme.palette.mode === 'dark' 
                                ? 'rgba(30, 30, 40, 0.6)'
                                : 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(10px)',
                              overflow: 'hidden',
                              position: 'relative'
                            }}>
                              <Box 
                                sx={{ 
                                  height: '4px', 
                                  width: '100%', 
                                  background: `linear-gradient(90deg, 
                                    ${analysis.sentiment > 0.7 ? theme.palette.success.main : 
                                    analysis.sentiment > 0.4 ? theme.palette.info.main : 
                                    theme.palette.error.main} 0%, 
                                    ${theme.palette.primary.main} 100%)`
                                }} 
                              />
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                      "{analysis.text}"
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                                        Sentiment Score: {analysis.sentiment.toFixed(2)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {analysis.date}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Button 
                                    variant="outlined" 
                                    size="small"
                                    sx={{ 
                                      borderRadius: 50,
                                      minWidth: '120px'
                                    }}
                                  >
                                    View Playlist
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </Zoom>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <GradientPaper elevation={0} sx={{ textAlign: 'center', py: 5 }}>
                      <TimelineOutlined sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No mood analysis history
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Use the mood analyzer to create your first mood analysis
                      </Typography>
                      <Button 
                        variant="contained"
                        sx={{ 
                          borderRadius: 50,
                          px: 3,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                          }
                        }}
                      >
                        Try Mood Analyzer
                      </Button>
                    </GradientPaper>
                  )}
                </div>
              </Fade>
            )}
          </div>
        </Fade>
      </Container>
    </Box>
  );
};

export default Dashboard; 