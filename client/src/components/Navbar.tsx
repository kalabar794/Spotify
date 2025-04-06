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
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          component={RouterLink}
          to="/"
        >
          <MusicNote />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="none">
            MoodMix
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="default"
                icon={<Brightness7 />}
                checkedIcon={<Brightness4 />}
              />
            }
            label=""
          />

          {isAuthenticated ? (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/dashboard"
                sx={{ mx: 1 }}
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mx: 1 }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 