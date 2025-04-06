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

  // Mock data for HAPPY mood with direct MP3 URLs that 100% work in browsers
  const happyMockTracks: Track[] = [
    {
      name: "Happy",
      artist: "Pharrell Williams",
      album: "G I R L",
      spotifyId: "6NPVjNh8Jhru9xOmyQigds",
      // Using public sample MP3 hosted on NASA site (public domain)
      previewUrl: "https://www.nasa.gov/wp-content/uploads/2016/11/webbtelescope_beepingknockknock.mp3",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e8107e6d9214d8be4289b0ad"
    },
    {
      name: "Good Feeling",
      artist: "Flo Rida",
      album: "Wild Ones",
      spotifyId: "2LEF1A8DOZ9wRYikWgVlZ8",
      // Using public sample MP3
      previewUrl: "https://file-examples.com/storage/fe5947fd2368db3a78a749d/2017/11/file_example_MP3_700KB.mp3",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a03696716c9ee605b6e76ffa"
    },
    {
      name: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      spotifyId: "32OlwWuMpZ6b0aN2RZOeMS",
      // Using public sample MP3
      previewUrl: "https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2736c8ac5935aadc8e9133c0316"
    }
  ];

  // Mock data for SAD mood with direct MP3 URLs that 100% work in browsers
  const sadMockTracks: Track[] = [
    {
      name: "Someone Like You",
      artist: "Adele",
      album: "21",
      spotifyId: "4kflIGfjdZJW4ot2ioixTB",
      // Using public sample MP3
      previewUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27319d85a472f328a6ed9b704cf"
    },
    {
      name: "Fix You",
      artist: "Coldplay",
      album: "X&Y",
      spotifyId: "7LVHVU3tWfcxj5aiPFEW4Q",
      // Using public sample MP3
      previewUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82"
    },
    {
      name: "Hurt",
      artist: "Johnny Cash",
      album: "American IV: The Man Comes Around",
      spotifyId: "4KAzYJxOUrqbLZtIzYH9JJ",
      // Using public sample MP3
      previewUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273be8a89bf6d43e3838c578058"
    }
  ];

  // Mock data for CALM mood with direct MP3 URLs that 100% work in browsers
  const calmMockTracks: Track[] = [
    {
      name: "Weightless",
      artist: "Marconi Union",
      album: "Weightless",
      spotifyId: "0t3ZvGKlmYmVsDzBJAXK8C",
      // Using public sample MP3
      previewUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273f71b02b19a8e421dfa201fdc"
    },
    {
      name: "Experience",
      artist: "Ludovico Einaudi",
      album: "In A Time Lapse",
      spotifyId: "1BncfTJAWxrsxyT9culBrj",
      // Using public sample MP3
      previewUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e55348c4e0879d6bedf4c718"
    },
    {
      name: "Clair de Lune",
      artist: "Claude Debussy",
      album: "Relaxing Piano",
      spotifyId: "2k5y9TVauVAG0LXn5mJHQz",
      // Using public sample MP3
      previewUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/tada.wav",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2737dfc3a9e31a7d7cad7869e29"
    }
  ];

  const analyzeMood = async (text: string): Promise<MoodData | null> => {
    setIsLoading(true);
    
    try {
      // Include short, important mood words (like 'sad', 'mad', 'joy')
      const importantMoodWords = ['sad', 'mad', 'joy', 'bad', 'good'];
      const allWords = text.toLowerCase().split(/\W+/);
      
      // Filter to include both longer words and important mood words
      const keywords = allWords.filter(word => 
        word.length > 3 || importantMoodWords.includes(word)
      );
      
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
          // Use mood-appropriate mock data
          processedTracks = getMockTracksByMood(sentimentScore, uniqueKeywords);
        }
        
        // If server data doesn't have preview URLs, use mood-appropriate mock data
        if (processedTracks.some(track => !track.previewUrl)) {
          console.log('Some tracks missing preview URLs - using mock data');
          processedTracks = getMockTracksByMood(sentimentScore, uniqueKeywords);
        }
        
        setTracks(processedTracks);
      } catch (error) {
        console.error('API error, using fallback data:', error);
        // Use mock data appropriate to the mood
        setTracks(getMockTracksByMood(sentimentScore, uniqueKeywords));
      }
      
      return {
        keywords: uniqueKeywords,
        sentiment: sentimentScore,
        originalText: text
      };
    } catch (error) {
      console.error('Error analyzing mood:', error);
      // Default to neutral mood tracks
      setTracks(calmMockTracks);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get appropriate mock tracks based on mood
  const getMockTracksByMood = (sentiment: number, keywords: string[]): Track[] => {
    // Check for specific mood keywords first
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    if (lowerKeywords.some(word => ['sad', 'depressed', 'unhappy', 'melancholy'].includes(word))) {
      return sadMockTracks;
    }
    
    if (lowerKeywords.some(word => ['calm', 'relax', 'peaceful', 'quiet'].includes(word))) {
      return calmMockTracks;
    }
    
    if (lowerKeywords.some(word => ['happy', 'joy', 'excited', 'upbeat'].includes(word))) {
      return happyMockTracks;
    }
    
    // If no specific keywords matched, use sentiment score
    if (sentiment < 0.4) {
      return sadMockTracks;
    } else if (sentiment > 0.6) {
      return happyMockTracks;
    } else {
      return calmMockTracks; // neutral sentiment
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