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
      setTracks(data);
      
      return {
        keywords: uniqueKeywords,
        sentiment: sentimentScore,
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