import React, { useState, useEffect, useRef } from 'react';
import './AudioPlayer.css';

const AudioPlayer = ({ previewUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [showControls, setShowControls] = useState(false); // Flag to toggle visible audio controls
  const [audioLogging, setAudioLogging] = useState([]); // Log audio operations
  const audioContextRef = useRef(null);
  
  // Initialize the audio context on component mount
  useEffect(() => {
    // Create or get existing Audio Context
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        setAudioLogging(prev => [...prev, `Audio context state: ${audioContextRef.current.state}`]);
      } catch (e) {
        setAudioLogging(prev => [...prev, `Audio context error: ${e.message}`]);
      }
    }
    
    return () => {
      // Clean up audio on unmount
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);
  
  // Function to ensure audio context is running
  const ensureAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        setAudioLogging(prev => [...prev, `Audio context resumed: ${audioContextRef.current.state}`]);
      }).catch(err => {
        setAudioLogging(prev => [...prev, `Audio context resume error: ${err.message}`]);
      });
    }
  };
  
  // Create a very simple beep sound directly with Web Audio API
  const createBeepSound = () => {
    ensureAudioContext();
    
    try {
      setAudioLogging(prev => [...prev, 'Creating beep sound...']);
      const audioCtx = audioContextRef.current;
      
      if (!audioCtx) {
        throw new Error('Audio context not available');
      }
      
      // Log the state of the audio context
      setAudioLogging(prev => [...prev, `Audio context state: ${audioCtx.state}`]);
      
      // Create oscillator
      const oscillator = audioCtx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 tone
      
      // Create gain node for volume control
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.1; // Lower volume
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Play sound
      oscillator.start();
      
      // Show success message
      setAudioLogging(prev => [...prev, 'Beep sound started']);
      setDebugInfo('Playing beep sound - direct Web Audio API');
      
      // Stop after 1 second
      setTimeout(() => {
        oscillator.stop();
        setAudioLogging(prev => [...prev, 'Beep sound stopped']);
      }, 1000);
      
      return true;
    } catch (e) {
      setDebugInfo(`Beep sound failed: ${e.message}`);
      setAudioLogging(prev => [...prev, `Beep sound error: ${e.message}`]);
      return false;
    }
  };
  
  // Create a test function to play a simple test sound
  const playTestSound = () => {
    ensureAudioContext();
    
    // Stop any existing playback
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    
    // Try direct Web Audio API first
    if (createBeepSound()) {
      return;
    }
  };
  
  // Toggle visible audio controls for debugging
  const toggleControls = () => {
    setShowControls(!showControls);
    setDebugInfo(showControls ? 'Controls hidden' : 'Controls visible - use them to play directly');
  };
  
  // Toggle showing detailed audio logging
  const toggleLogging = () => {
    setAudioLogging(prev => prev.length > 0 ? [] : ['Audio logging enabled']);
  };
  
  // Play the actual audio file/data
  const playAudio = () => {
    // Make sure audio context is running first
    ensureAudioContext();
    
    if (!previewUrl) {
      setDebugInfo('No preview URL provided');
      setAudioLogging(prev => [...prev, 'No preview URL available']);
      return;
    }
    
    // If already playing, stop it
    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      setDebugInfo('Playback stopped');
      setAudioLogging(prev => [...prev, 'Playback stopped']);
      return;
    }
    
    // Always reset error state when attempting to play
    setError(false);
    setDebugInfo('Attempting to play...');
    
    // Special handler for data URLs (base64 audio)
    if (previewUrl.startsWith('data:audio')) {
      setDebugInfo('Detected base64 encoded audio - trying simple Audio element');
      setAudioLogging(prev => [...prev, 'Trying to play base64 audio...']);
      
      try {
        // Create a bare Audio element
        const audio = new Audio();
        
        // Add event listeners
        audio.oncanplaythrough = () => {
          setAudioLogging(prev => [...prev, 'Base64 audio ready to play']);
        };
        
        audio.onplay = () => {
          setIsPlaying(true);
          setAudioLogging(prev => [...prev, 'Base64 audio started playing']);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setAudioLogging(prev => [...prev, 'Base64 audio playback ended']);
        };
        
        audio.onerror = (e) => {
          setError(true);
          setAudioLogging(prev => [...prev, `Base64 audio error: ${audio.error ? audio.error.code : 'unknown'}`]);
        };
        
        // Set source and load
        audio.src = previewUrl;
        audio.volume = 0.5; // Set to half volume for safety
        
        // Start playing - but first make sure audio context is active
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  setAudioElement(audio);
                  setDebugInfo('Base64 audio playing');
                })
                .catch(err => {
                  setError(true);
                  setDebugInfo(`Playback error: ${err.message}`);
                  setAudioLogging(prev => [...prev, `Playback error: ${err.name} - ${err.message}`]);
                });
            }
          });
        } else {
          // Context already running or not available, try playing directly
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setAudioElement(audio);
                setDebugInfo('Base64 audio playing');
              })
              .catch(err => {
                setError(true);
                setDebugInfo(`Playback error: ${err.message}`);
                setAudioLogging(prev => [...prev, `Playback error: ${err.name} - ${err.message}`]);
              });
          }
        }
      } catch (e) {
        setError(true);
        setDebugInfo(`Base64 audio error: ${e.message}`);
        setAudioLogging(prev => [...prev, `Base64 audio exception: ${e.message}`]);
      }
      
      return;
    }
    
    // Regular URL audio handling
    setAudioLogging(prev => [...prev, `Attempting to play URL: ${previewUrl}`]);
    
    try {
      // Use the CORS proxy for regular URLs to avoid CORS issues
      const proxiedUrl = `/api/cors-proxy?url=${encodeURIComponent(previewUrl)}`;
      setDebugInfo(`Using CORS proxy: ${proxiedUrl.substring(0, 30)}...`);
      setAudioLogging(prev => [...prev, `Proxied URL: ${proxiedUrl}`]);
      
      // Create dedicated audio element
      const audio = new Audio();
      audio.volume = 0.5; // Set to half volume for safety
      
      // Add event listeners for debugging
      audio.addEventListener('canplaythrough', () => {
        setAudioLogging(prev => [...prev, 'Audio can play through']);
      });
      
      audio.addEventListener('play', () => {
        setAudioLogging(prev => [...prev, 'Audio play event fired']);
      });
      
      audio.addEventListener('playing', () => {
        setAudioLogging(prev => [...prev, 'Audio playing event fired']);
      });
      
      audio.addEventListener('waiting', () => {
        setAudioLogging(prev => [...prev, 'Audio waiting for data']);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioLogging(prev => [...prev, 'Audio playback ended']);
      });
      
      audio.addEventListener('error', (e) => {
        setAudioLogging(prev => [...prev, `Audio error: ${audio.error ? `${audio.error.code} - ${audio.error.message}` : 'unknown'}`]);
        
        // Try with direct preview-proxy
        setAudioLogging(prev => [...prev, 'Trying preview-proxy instead...']);
        const alternateUrl = `/api/preview-proxy?url=${encodeURIComponent(previewUrl)}`;
        audio.src = alternateUrl;
        
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setAudioElement(audio);
            setAudioLogging(prev => [...prev, 'Playing with preview-proxy']);
          })
          .catch(err => {
            setAudioLogging(prev => [...prev, `Preview-proxy error: ${err.message}`]);
            tryFallbackPlayback(previewUrl);
          });
      });
      
      // Set source and play
      audio.src = proxiedUrl;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioElement(audio);
            setDebugInfo('Playing...');
            setAudioLogging(prev => [...prev, 'Playback started successfully']);
          })
          .catch(err => {
            setDebugInfo(`Play failed: ${err.message}`);
            setAudioLogging(prev => [...prev, `Playback error: ${err.name} - ${err.message}`]);
            tryFallbackPlayback(previewUrl);
          });
      }
    } catch (e) {
      setError(true);
      setDebugInfo(`General error: ${e.message}`);
      setAudioLogging(prev => [...prev, `General exception: ${e.message}`]);
    }
  };
  
  // Helper function for fallback playback methods
  const tryFallbackPlayback = (originalUrl) => {
    setDebugInfo('Trying fallback method...');
    setAudioLogging(prev => [...prev, 'Trying fallback playback with direct URL']);
    
    // Create an audio element in the DOM for better browser support
    const audioEl = document.createElement('audio');
    audioEl.controls = showControls;
    audioEl.src = originalUrl; // Try direct URL first
    audioEl.volume = 0.5; // Set to half volume for safety
    audioEl.style.display = showControls ? 'block' : 'none';
    document.body.appendChild(audioEl);
    
    // Try to play it
    audioEl.play()
      .then(() => {
        setIsPlaying(true);
        setAudioElement(audioEl);
        setDebugInfo('Fallback playing with direct URL');
        setAudioLogging(prev => [...prev, 'Fallback playback successful']);
        
        audioEl.addEventListener('ended', () => {
          setIsPlaying(false);
          if (!showControls) {
            document.body.removeChild(audioEl);
          }
          setAudioLogging(prev => [...prev, 'Fallback playback ended']);
        });
      })
      .catch(fbErr => {
        setAudioLogging(prev => [...prev, `Direct URL fallback failed: ${fbErr.message}`]);
        
        // Try a simple beep sound
        if (createBeepSound()) {
          setAudioLogging(prev => [...prev, 'Created test beep sound']);
        }
      });
  };

  return (
    <div className="audio-player">
      <div className="button-group">
        <button 
          onClick={playAudio} 
          disabled={!previewUrl}
          className={`play-button ${error ? 'error' : ''}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? '■' : '▶'}
        </button>
        
        <button 
          onClick={playTestSound}
          className="test-button"
          title="Play test sound"
        >
          Test Audio
        </button>
        
        <button 
          onClick={toggleControls}
          className="controls-button"
          title="Show/hide audio controls"
        >
          {showControls ? "Hide Controls" : "Show Controls"}
        </button>
        
        <button 
          onClick={toggleLogging}
          className="log-button"
          title="Toggle audio logging"
        >
          {audioLogging.length > 0 ? "Hide Logs" : "Show Logs"}
        </button>
      </div>
      
      {debugInfo && <div className="debug-info">{debugInfo}</div>}
      
      {/* Direct audio element for testing */}
      {showControls && previewUrl && (
        <div className="direct-audio">
          <p className="debug-info">Direct audio player:</p>
          <audio 
            controls 
            src={previewUrl.startsWith('data:') ? previewUrl : `/api/cors-proxy?url=${encodeURIComponent(previewUrl)}`}
            style={{width: '100%', marginTop: '10px'}}
          />
        </div>
      )}
      
      {/* Audio logging */}
      {audioLogging.length > 0 && (
        <div className="audio-log">
          <p className="log-title">Audio Log:</p>
          <div className="log-entries">
            {audioLogging.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer; 