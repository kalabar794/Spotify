import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Track {
  name: string;
  artist: string;
  album?: string;
  spotifyId: string;
  previewUrl?: string;
  albumArt?: string;
}

interface MoodData {
  keywords: string[];
  sentiment: number;
  originalText: string;
}

interface MoodContextType {
  moodText: string;
  setMoodText: (text: string) => void;
  tracks: Track[];
  isLoading: boolean;
  analyzeMood: (text: string) => Promise<MoodData | null>;
  clearTracks: () => void;
}

const MoodContext = createContext<MoodContextType>({
  moodText: '',
  setMoodText: () => {},
  tracks: [],
  isLoading: false,
  analyzeMood: async () => null,
  clearTracks: () => {},
});

interface MoodProviderProps {
  children: ReactNode;
}

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [moodText, setMoodText] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demo purposes
  const mockTracks: Track[] = [
    {
      name: "Happy",
      artist: "Pharrell Williams",
      album: "G I R L",
      spotifyId: "spotify:track:60nZcImufyMA1MKQY3dcCO",
      previewUrl: "https://p.scdn.co/mp3-preview/d72f46ad2ac9c9d93231b96a1a5b175d64ea5419",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e8107e6d9214d8be4289b0ad"
    },
    {
      name: "Good Feeling",
      artist: "Flo Rida",
      album: "Wild Ones",
      spotifyId: "spotify:track:2LEF1A8DOZ9wRYikWgVlZ8",
      previewUrl: "https://p.scdn.co/mp3-preview/4aaafdf0af3f349825c7c1b5feace804bd04bb1e",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a03696716c9ee605b6e76ffa"
    },
    {
      name: "Walking on Sunshine",
      artist: "Katrina & The Waves",
      album: "Katrina & The Waves",
      spotifyId: "spotify:track:05wIrZSwuaVWhcv5FfqeH0",
      previewUrl: "https://p.scdn.co/mp3-preview/b3d8fc348639c888dc95d7b3fa9accd0f83fe158",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2731d5c3bbc1cdb7a10af419f6c"
    }
  ];

  const analyzeMood = async (text: string): Promise<MoodData | null> => {
    setIsLoading(true);
    
    try {
      // Mock API call for mood analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple sentiment analysis based on keywords
      const keywords = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
      const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 5);
      
      // In a real app, this would be a call to a sentiment analysis API
      const sentiment = text.toLowerCase().includes('happy') || text.toLowerCase().includes('good') ? 1 : 0.5;
      
      // Generate tracks based on mood
      setTracks(mockTracks);
      
      return {
        keywords: uniqueKeywords,
        sentiment,
        originalText: text
      };
    } catch (error) {
      console.error('Error analyzing mood:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearTracks = () => {
    setTracks([]);
  };

  return (
    <MoodContext.Provider
      value={{
        moodText,
        setMoodText,
        tracks,
        isLoading,
        analyzeMood,
        clearTracks,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => useContext(MoodContext);

export default MoodProvider; 