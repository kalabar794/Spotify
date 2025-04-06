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

  // Mock data for fallback with guaranteed preview URLs
  const mockTracks: Track[] = [
    {
      name: "Happy",
      artist: "Pharrell Williams",
      album: "G I R L",
      spotifyId: "60nZcImufyMA1MKQY3dcCO",
      previewUrl: "https://p.scdn.co/mp3-preview/d72f46ad2ac9c9d93231b96a1a5b175d64ea5419",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e8107e6d9214d8be4289b0ad"
    },
    {
      name: "Good Feeling",
      artist: "Flo Rida",
      album: "Wild Ones",
      spotifyId: "2LEF1A8DOZ9wRYikWgVlZ8",
      previewUrl: "https://p.scdn.co/mp3-preview/4aaafdf0af3f349825c7c1b5feace804bd04bb1e",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a03696716c9ee605b6e76ffa"
    },
    {
      name: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      spotifyId: "32OlwWuMpZ6b0aN2RZOeMS",
      previewUrl: "https://p.scdn.co/mp3-preview/d72f46ad2ac9c9d93231b96a1a5b175d64ea5419",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2736c8ac5935aadc8e9133c0316"
    }
  ];

  const analyzeMood = async (text: string): Promise<MoodData | null> => {
    setIsLoading(true);
    
    try {
      // Simple sentiment analysis based on keywords
      const keywords = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
      const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 5);
      
      // Perform a basic sentiment analysis
      // Positive keywords
      const positiveWords = ['happy', 'joy', 'excited', 'good', 'great', 'amazing', 'love', 'wonderful'];
      // Negative keywords
      const negativeWords = ['sad', 'unhappy', 'depressed', 'bad', 'terrible', 'awful', 'hate', 'angry'];
      
      let sentimentScore = 0.5; // Neutral default
      
      // Count positive and negative words
      const positiveCount = keywords.filter(word => positiveWords.includes(word)).length;
      const negativeCount = keywords.filter(word => negativeWords.includes(word)).length;
      
      // Calculate sentiment
      if (positiveCount > negativeCount) {
        sentimentScore = 0.5 + (positiveCount / keywords.length) * 0.5;
      } else if (negativeCount > positiveCount) {
        sentimentScore = 0.5 - (negativeCount / keywords.length) * 0.5;
      }
      
      // API call to get Spotify recommendations
      try {
        const response = await fetch('/api/mood/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            moodKeywords: uniqueKeywords,
            sentiment: sentimentScore,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get music recommendations');
        }
        
        const data = await response.json();
        
        // Check if the response contains tracks directly or in a tracks property
        let processedTracks: Track[] = [];
        
        if (Array.isArray(data)) {
          processedTracks = data;
        } else if (data.tracks && Array.isArray(data.tracks)) {
          processedTracks = data.tracks;
        } else {
          console.error('Unexpected response format:', data);
          processedTracks = mockTracks;
        }
        
        // For the demo, ensure we have valid preview URLs
        // If server data doesn't have preview URLs, use mock data
        if (processedTracks.some(track => !track.previewUrl)) {
          console.log('Some tracks missing preview URLs - using mock data');
          processedTracks = mockTracks;
        }
        
        setTracks(processedTracks);
      } catch (error) {
        console.error('API error, using fallback data:', error);
        // Use mock data as fallback
        setTracks(mockTracks);
      }
      
      return {
        keywords: uniqueKeywords,
        sentiment: sentimentScore,
        originalText: text
      };
    } catch (error) {
      console.error('Error analyzing mood:', error);
      setTracks(mockTracks);
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