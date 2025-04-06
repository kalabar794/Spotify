import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper } from '@mui/material';

const NotFound: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          py: 4,
          textAlign: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: 500 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" paragraph>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            size="large"
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound; 