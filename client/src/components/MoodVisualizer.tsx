import React from 'react';
import { Paper, Typography, Box, Chip, useTheme } from '@mui/material';

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

interface MoodVisualizerProps {
  mood: Mood;
}

const MoodVisualizer: React.FC<MoodVisualizerProps> = ({ mood }) => {
  const theme = useTheme();
  
  // Scale sentiment to a percentage for visualization
  const sentimentPercentage = ((mood.sentiment + 1) / 2) * 100;
  
  // Determine sentiment label
  let sentimentLabel = 'Neutral';
  if (mood.sentiment > 0.3) sentimentLabel = 'Positive';
  if (mood.sentiment > 0.6) sentimentLabel = 'Very Positive';
  if (mood.sentiment < -0.3) sentimentLabel = 'Negative';
  if (mood.sentiment < -0.6) sentimentLabel = 'Very Negative';
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' 
          ? `rgba(${parseInt(mood.colorScheme.primary.slice(1, 3), 16)}, ${parseInt(mood.colorScheme.primary.slice(3, 5), 16)}, ${parseInt(mood.colorScheme.primary.slice(5, 7), 16)}, 0.3)`
          : mood.colorScheme.primary + '20', // Add transparency
        border: `1px solid ${mood.colorScheme.primary}`,
        mb: { xs: 2, md: 0 }
      }}
    >
      <Typography variant="h6" gutterBottom>Your Mood Analysis</Typography>
      
      <Typography variant="body2" paragraph>
        "{mood.originalText.length > 100 ? mood.originalText.substring(0, 100) + '...' : mood.originalText}"
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Sentiment: {sentimentLabel} ({Math.round(mood.sentiment * 100) / 100})
        </Typography>
        <Box 
          sx={{ 
            width: '100%', 
            height: 10, 
            bgcolor: 'grey.300',
            borderRadius: 5
          }}
        >
          <Box 
            sx={{ 
              width: `${sentimentPercentage}%`, 
              height: '100%',
              borderRadius: 5,
              background: `linear-gradient(90deg, ${mood.colorScheme.secondary}, ${mood.colorScheme.primary})`
            }} 
          />
        </Box>
      </Box>

      <Typography variant="body2" gutterBottom>Mood Keywords:</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {mood.keywords.map((keyword, index) => (
          <Chip 
            key={index} 
            label={keyword} 
            size="small"
            sx={{ 
              backgroundColor: mood.colorScheme.secondary,
              color: theme.palette.getContrastText(mood.colorScheme.secondary)
            }}
          />
        ))}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This playlist is tailored based on your emotional state. The colors and music selection 
          are designed to complement your current mood.
        </Typography>
      </Box>
    </Paper>
  );
};

export default MoodVisualizer; 