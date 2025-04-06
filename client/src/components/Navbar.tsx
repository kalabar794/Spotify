import React, { useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box,
  Link,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Brightness4, Brightness7, MusicNote } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode }) => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(to right, #6247aa, #a06cd5)',
        boxShadow: 'none',
        py: 1
      }}
    >
      <Toolbar sx={{ minHeight: 80 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, fontSize: 30 }}
          component={RouterLink}
          to="/"
        >
          <MusicNote sx={{ fontSize: 30 }} />
        </IconButton>
        
        <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="none">
            MoodMix
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/home"
            sx={{ 
              fontWeight: 600,
              mx: 1.5,
              fontSize: '1rem',
              px: 2,
              py: 1,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            EXPLORE
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/dashboard"
                sx={{ 
                  fontWeight: 600,
                  mx: 1.5,
                  fontSize: '1rem',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                DASHBOARD
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                LOGOUT
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 600,
                  mx: 1.5,
                  fontSize: '1rem',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                LOGIN
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 2,
                  py: 1,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                REGISTER
              </Button>
            </>
          )}
          
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="default"
                icon={<Brightness7 sx={{ fontSize: 24 }} />}
                checkedIcon={<Brightness4 sx={{ fontSize: 24 }} />}
              />
            }
            label=""
            sx={{ ml: 2 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 