import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, TextField, Button, Paper } from '@mui/material';
import { MusicNote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const [mood, setMood] = useState('');
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      // Navigate to home page with the mood parameter
      navigate(`/home?mood=${encodeURIComponent(mood.trim())}`);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 80px)', // Full height minus navbar
        width: '100%',
        background: 'linear-gradient(135deg, #6247aa, #a06cd5, #7076e2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
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

      {/* Main title */}
      <Box 
        sx={{ 
          position: 'relative', 
          zIndex: 1, 
          textAlign: 'center',
          mb: 6 
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
            fontWeight: 800,
            color: 'white',
            textShadow: '0 0 20px rgba(0,0,0,0.3)',
            mb: 2,
            animation: 'pulse 3s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          MoodMix
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '600px',
            mx: 'auto',
            textShadow: '0 0 10px rgba(0,0,0,0.2)',
            animation: 'fadeIn 2s',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
        >
          Find the perfect soundtrack for your emotions
        </Typography>
      </Box>

      {/* Mood input card */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Paper
          elevation={3}
          sx={{
            maxWidth: 500,
            mx: 'auto',
            bgcolor: '#1e1e2f',
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'slideUp 1s ease-out',
            '@keyframes slideUp': {
              '0%': { transform: 'translateY(50px)', opacity: 0 },
              '100%': { transform: 'translateY(0)', opacity: 1 }
            }
          }}
        >
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <MusicNote sx={{ fontSize: 60, color: '#a06cd5' }} />
          </Box>

          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              color: '#a06cd5',
              fontWeight: 600,
              mb: 2
            }}
          >
            How are you feeling today?
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              color: '#adb5bd',
              mb: 4
            }}
          >
            Describe your mood or situation, and we'll create
            a personalized playlist that matches your
            emotional state.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your mood..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              variant="outlined"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: '#141421',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#a06cd5',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#e2e2e2',
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<MusicNote />}
              disabled={!mood.trim()}
              sx={{
                bgcolor: '#a06cd5',
                '&:hover': {
                  bgcolor: '#8a5dc9',
                },
                borderRadius: 50,
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:not(:disabled):hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }
              }}
            >
              Find My Music
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default HeroSection; 