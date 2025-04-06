import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Track {
  spotifyId: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
}

interface MoodData {
  keywords: string[];
  sentiment: number;
  originalText: string;
}

interface MoodContextType {
  moodText: string;
  setMoodText: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  error: string | null;
  tracks: Track[] | null;
  analyzeMood: (text: string) => Promise<MoodData | null>;
  clearTracks: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [moodText, setMoodText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null);

  // Get the base URL dynamically - fallback to localhost:9090 if development
  const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:9090' 
    : '';

  const analyzeMood = async (text: string): Promise<MoodData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Analyzing mood for:', text);
      
      // Try direct API call first
      const response = await fetch(`${BASE_URL}/api/analyze-mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Mood analysis response:', data);
      
      if (data.tracks && Array.isArray(data.tracks)) {
        setTracks(data.tracks);
      } else {
        console.warn('No tracks received in response:', data);
        setTracks([]); // Empty array instead of null for consistent UI
      }
      
      return data.mood || null;
    } catch (err) {
      console.error('Error analyzing mood:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to analyze mood: ${errorMessage}`);
      
      // Important: return a default mood object even on error
      return {
        keywords: [text.toLowerCase()],
        sentiment: 1,
        originalText: text
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearTracks = () => {
    setTracks(null);
  };

  return (
    <MoodContext.Provider
      value={{
        moodText,
        setMoodText,
        isLoading,
        error,
        tracks,
        analyzeMood,
        clearTracks
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}; 