import React, { useState, useEffect, useRef } from 'react';

const SimpleAudioPlayer = ({ source }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Function to generate a test beep sound for debugging
  const playTestSound = () => {
    try {
      setDebugMessage('Creating test sound...');
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set properties for the test sound - fixing frequency method
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Fixed method to setValueAtTime
      gainNode.gain.value = 0.5;
      
      // Play the sound for 0.5 seconds
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        setDebugMessage('Test sound played successfully');
      }, 500);
    } catch (err) {
      setDebugMessage(`Test sound error: ${err.message}`);
      console.error('Test sound error:', err);
    }
  };

  // Function to play the provided audio source
  const playAudio = () => {
    if (isPlaying && audioRef.current) {
      // If already playing, pause it
      audioRef.current.pause();
      setIsPlaying(false);
      setDebugMessage('Audio paused');
      return;
    }
    
    setAudioError(false);
    setDebugMessage('Setting up audio...');
    
    try {
      // Create a new audio element if needed
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      // Set up event listeners
      audioRef.current.oncanplaythrough = () => {
        setDebugMessage('Audio ready to play through');
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setDebugMessage('Audio playing');
            setDuration(audioRef.current.duration);
          })
          .catch(err => {
            setAudioError(true);
            setDebugMessage(`Play error: ${err.message}`);
            console.error('Audio play error:', err);
          });
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setDebugMessage('Audio playback ended');
        setProgress(0);
      };
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      };
      
      audioRef.current.onerror = (e) => {
        setAudioError(true);
        setIsPlaying(false);
        setDebugMessage(`Audio error: ${e.target.error ? e.target.error.message : 'Unknown error'}`);
        console.error('Audio error:', e);
        
        // Try using a CORS proxy if the source appears to be a Spotify URL
        if (source && source.includes('spotify.com')) {
          setDebugMessage('Attempting to use Spotify URL through proxy...');
          audioRef.current.src = `/api/proxy?url=${encodeURIComponent(source)}`;
          audioRef.current.load();
        }
      };
      
      // Set source and load
      console.log('Audio source type:', typeof source);
      console.log('Audio source length:', source ? source.length : 0);
      
      if (!source) {
        throw new Error('No audio source provided');
      }
      
      // Handle potential CORS issues by checking source type
      if (source.startsWith('https://p.scdn.co/') || source.startsWith('https://audio-ssl.itunes.apple.com/')) {
        setDebugMessage('Using external streaming URL through proxy...');
        audioRef.current.src = `/api/proxy?url=${encodeURIComponent(source)}`;
      } else {
        audioRef.current.src = source;
      }
      
      audioRef.current.load();
      setDebugMessage('Audio source set and loading');
    } catch (err) {
      setAudioError(true);
      setDebugMessage(`Setup error: ${err.message}`);
      console.error('Audio setup error:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update audio source if it changes
  useEffect(() => {
    if (audioRef.current && source) {
      // Reset state for new source
      setIsPlaying(false);
      setAudioError(false);
      setProgress(0);
      
      // If we were previously playing, try to load and play new source
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        playAudio();
      }
    }
  }, [source]);

  // Format time in MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Improved styles for a more modern, attractive UI
  const containerStyle = {
    backgroundColor: 'rgba(25, 20, 20, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '8px'
  };

  const buttonStyle = {
    padding: '10px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    border: 'none',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const playButtonStyle = {
    ...buttonStyle,
    backgroundColor: audioError ? '#e74c3c' : isPlaying ? '#3498db' : '#1DB954',
    color: 'white',
    width: '100px',
    fontSize: '14px',
    transform: 'scale(1)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
  };
  
  const testButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f39c12',
    color: 'white',
    fontSize: '12px',
    padding: '8px 12px'
  };
  
  const debugStyle = {
    marginTop: '8px',
    fontSize: '12px',
    color: audioError ? '#e74c3c' : '#7f8c8d',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '8px',
    borderRadius: '4px',
    maxHeight: '60px',
    overflowY: 'auto'
  };

  const progressBarContainerStyle = {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px'
  };

  const progressBarStyle = {
    height: '100%',
    width: `${duration ? (progress / duration) * 100 : 0}%`,
    backgroundColor: isPlaying ? '#1DB954' : '#3498db',
    borderRadius: '4px',
    transition: 'width 0.2s linear'
  };

  const timeDisplayStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px'
  };

  return (
    <div 
      style={containerStyle} 
      className="simple-audio-player"
      data-testid="audio-player"
    >
      <div style={buttonContainerStyle}>
        <button
          style={playButtonStyle}
          onClick={playAudio}
          disabled={!source && !audioError}
          data-testid="play-button"
        >
          {isPlaying ? '❚❚ Pause' : '▶ Play'}
        </button>
        
        <button 
          style={testButtonStyle}
          onClick={playTestSound}
          data-testid="test-sound-button"
        >
          Test Sound
        </button>
      </div>
      
      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={progressBarStyle}></div>
      </div>
      
      {/* Time display */}
      <div style={timeDisplayStyle}>
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      {debugMessage && (
        <div 
          style={debugStyle}
          data-testid="debug-message"
        >
          {debugMessage}
        </div>
      )}
    </div>
  );
};

export default SimpleAudioPlayer; 