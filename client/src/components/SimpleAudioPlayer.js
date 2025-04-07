import React, { useState, useEffect, useRef } from 'react';

const SimpleAudioPlayer = ({ source }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [attemptedProxy, setAttemptedProxy] = useState(false);

  // Function to generate a test beep sound for debugging
  const playTestSound = () => {
    try {
      setDebugMessage('Creating test sound...');
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('AudioContext resumed successfully');
        });
      }
      
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
      
      // Remove any existing event listeners to prevent duplicates
      audioRef.current.oncanplaythrough = null;
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onerror = null;
      
      // Set up event listeners
      audioRef.current.oncanplaythrough = () => {
        setDebugMessage('Audio ready to play through');
        // Create and resume audio context to enable audio in browsers that block autoplay
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setDebugMessage('Audio playing');
            setDuration(audioRef.current.duration || 30); // Default to 30s if duration unknown
          })
          .catch(err => {
            setAudioError(true);
            setDebugMessage(`Play error: ${err.message}`);
            console.error('Audio play error:', err);
            
            // Try playing with a user gesture handler as fallback
            document.addEventListener('click', function playOnGesture() {
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setDebugMessage('Audio playing after user gesture');
                  document.removeEventListener('click', playOnGesture);
                })
                .catch(e => console.error('Still cannot play after gesture:', e));
            }, { once: true });
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
        const errorMsg = e.target.error ? e.target.error.message : 'Unknown error';
        console.error('Audio error:', e, errorMsg);
        setAudioError(true);
        setIsPlaying(false);
        setDebugMessage(`Audio error: ${errorMsg}`);
        
        // Try using a CORS proxy if the source appears to be an external URL
        if (source && !attemptedProxy && 
            (source.startsWith('http') || source.startsWith('//'))) {
          setDebugMessage('Attempting to use URL through proxy...');
          setAttemptedProxy(true);
          
          // Try the proxy endpoint
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(source)}`;
          console.log('Trying proxy URL:', proxyUrl);
          audioRef.current.src = proxyUrl;
          audioRef.current.load();
          
          // Wait a moment and try to play again
          setTimeout(() => {
            try {
              audioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setAudioError(false);
                  setDebugMessage('Audio playing through proxy');
                })
                .catch(proxyErr => {
                  console.error('Proxy playback error:', proxyErr);
                  setDebugMessage(`Proxy error: ${proxyErr.message}`);
                  
                  // As a last resort, try playing a default audio file
                  tryFallbackAudio();
                });
            } catch (playErr) {
              console.error('Error playing through proxy:', playErr);
              tryFallbackAudio();
            }
          }, 500);
        } else if (!attemptedProxy) {
          // If not an external URL or proxy already attempted, try fallback
          tryFallbackAudio();
        }
      };
      
      // Set source and load
      console.log('Audio source type:', typeof source);
      console.log('Audio source length:', source ? source.length : 0);
      console.log('Audio source value:', source);
      
      if (!source) {
        throw new Error('No audio source provided');
      }
      
      // Reset proxy attempt flag when source changes
      setAttemptedProxy(false);
      
      // Handle potential CORS issues by checking source type
      if (source.startsWith('https://p.scdn.co/') || 
          source.startsWith('https://audio-ssl.itunes.apple.com/')) {
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
      
      // Try fallback audio if setup fails
      tryFallbackAudio();
    }
  };
  
  // Function to try playing a fallback audio as last resort
  const tryFallbackAudio = () => {
    try {
      setDebugMessage('Trying fallback audio...');
      // Embedded base64 beep sound as absolute last resort
      const fallbackAudio = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAFwAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/////////////////////////////////+M4wDv/i5rCEQcAANBuKK3XdujQfBuGIYhicIQeD4cHnMYIN4PggwcH8Hw4ggwfBA/BAEHAIHg+CDHiCIYfQQYPggaDgiCB/4PgQCD4Ig+CIOAQPh8QfAkHwQY8fB5w4IPggCEAwIAOgAwAAwBuBgYLgjgAIAAAAACsAAADgAA/8YAAAONiZCXjYAAAAMAAAMAADA4CAgGAAAEAAAOAB+JZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAE5pbXBvcnRlZCBmcm9tIGlDb3JlLg==";
      
      if (audioRef.current) {
        audioRef.current.src = fallbackAudio;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setDebugMessage('Fallback audio playing');
          })
          .catch(err => {
            setDebugMessage(`Fallback audio failed: ${err.message}`);
            console.error('Fallback audio failed:', err);
          });
      }
    } catch (err) {
      setDebugMessage(`All audio attempts failed: ${err.message}`);
      console.error('All audio attempts failed:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.oncanplaythrough = null;
        audioRef.current.onended = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onerror = null;
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
      setAttemptedProxy(false);
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