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

// Base64-encoded short audio clips
const happyAudio = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAFwAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/////////////////////////////////+M4wDv/i5rCEQcAANBuKK3XdujQfBuGIYhicIQeD4cHnMYIN4PggwcH8Hw4ggwfBA/BAEHAIHg+CDHiCIYfQQYPggaDgiCB/4PgQCD4Ig+CIOAQPh8QfAkHwQY8fB5w4IPggCEAwIAOgAwAAwBuBgYLgjgAIAAAAACsAAADgAA/8YAAAONiZCXjYAAAAMAAAMAADA4CAgGAAAEAAAOAB+JZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAE5pbXBvcnRlZCBmcm9tIGlDb3JlLg==";
const sadAudio = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAFwAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/////////////////////////////////+M4wDv/i5rCEQcAANBuKKrrdukYPgbxsHwbB8MAQdjBBvB8EGDzoMHwfggwcH4Pgg4BAIHg+CDHiCIYfQQYPggaDgiCB4IOAQCDgEDwJB8EGPHwecOCD4IAhAMCADoAMAAMAYAgYLgjgAIAAAAACsAAADgAA/8YAAAONiZCXjYAAAAMAAAMAADD4CAgGAAAEAAAOAB+JZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAE5pbXBvcnRlZCBmcm9tIGlDb3JlLg==";
const calmAudio = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTguMjkuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [moodText, setMoodText] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for HAPPY mood with embedded audio data
  const happyMockTracks: Track[] = [
    {
      name: "Happy",
      artist: "Pharrell Williams",
      album: "G I R L",
      spotifyId: "6NPVjNh8Jhru9xOmyQigds",
      // Using embedded base64 audio data
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e8107e6d9214d8be4289b0ad"
    },
    {
      name: "Good Feeling",
      artist: "Flo Rida",
      album: "Wild Ones",
      spotifyId: "2LEF1A8DOZ9wRYikWgVlZ8",
      // Using embedded base64 audio data
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a03696716c9ee605b6e76ffa"
    },
    {
      name: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      album: "Uptown Special",
      spotifyId: "32OlwWuMpZ6b0aN2RZOeMS",
      // Using embedded base64 audio data
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b2736c8ac5935aadc8e9133c0316"
    },
    {
      name: "Can't Stop the Feeling!",
      artist: "Justin Timberlake",
      album: "Trolls (Original Motion Picture Soundtrack)",
      spotifyId: "1JCCdiru7fhstOIF4N7WJC",
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273908280d9807127e185b71d37"
    },
    {
      name: "Shake It Off",
      artist: "Taylor Swift",
      album: "1989",
      spotifyId: "0cqRj7pUJDkTCEsJkx8snD",
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b2739abdf14e6058bd3903686148"
    },
    {
      name: "I Gotta Feeling",
      artist: "Black Eyed Peas",
      album: "THE E.N.D. (THE ENERGY NEVER DIES)",
      spotifyId: "4W4fNrZYkobj539TOWsLO2",
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b27376b7b1664174a14d6287f4c9"
    },
    {
      name: "The Middle",
      artist: "Zedd, Maren Morris, Grey",
      album: "The Middle",
      spotifyId: "0ct6r3EGTcMLPtrXHDvVjc",
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c03c5c4acb47ba3afcbaf8f9"
    },
    {
      name: "Dynamite",
      artist: "BTS",
      album: "Dynamite (DayTime Version)",
      spotifyId: "6ebkx7Q3tIrTXCK2lMRmF9",
      previewUrl: happyAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273344c3661f8a283e4bcf8a696"
    }
  ];

  // Mock data for SAD mood with embedded audio data
  const sadMockTracks: Track[] = [
    {
      name: "Someone Like You",
      artist: "Adele",
      album: "21",
      spotifyId: "4kflIGfjdZJW4ot2ioixTB",
      // Using embedded base64 audio data
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b27319d85a472f328a6ed9b704cf"
    },
    {
      name: "Fix You",
      artist: "Coldplay",
      album: "X&Y",
      spotifyId: "7LVHVU3tWfcxj5aiPFEW4Q",
      // Using embedded base64 audio data
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82"
    },
    {
      name: "Hurt",
      artist: "Johnny Cash",
      album: "American IV: The Man Comes Around",
      spotifyId: "4KAzYJxOUrqbLZtIzYH9JJ",
      // Using embedded base64 audio data
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273be8a89bf6d43e3838c578058"
    },
    {
      name: "Hello",
      artist: "Adele",
      album: "25",
      spotifyId: "0ENSn4fwAbCGeFGVUbXEU3",
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273856b7a4f1c234a7ebe4f8775"
    },
    {
      name: "Say Something",
      artist: "A Great Big World, Christina Aguilera",
      album: "Is There Anybody Out There?",
      spotifyId: "2GLMjDdZ7jH7G5r5Fz5Yfo",
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b2739abcb1f7c9f4269c5f86fe61"
    },
    {
      name: "Tears in Heaven",
      artist: "Eric Clapton",
      album: "Unplugged",
      spotifyId: "3vkQ5DAB1qQMYO4Mr9zJN6",
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e38a30277fcd883ec4fc61fc"
    },
    {
      name: "Skinny Love",
      artist: "Birdy",
      album: "Birdy (Deluxe Version)",
      spotifyId: "6PJfFBxYAGBxo3OaTO0UQj",
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e9c63b6e208db22c2a7aeff7"
    },
    {
      name: "Photograph",
      artist: "Ed Sheeran",
      album: "x (Deluxe Edition)",
      spotifyId: "1HNkqx9Ahdgi1Ixy2xkKkL",
      previewUrl: sadAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b27326e080d91228d117413b1f9d"
    }
  ];

  // Mock data for CALM mood with embedded audio data
  const calmMockTracks: Track[] = [
    {
      name: "Weightless",
      artist: "Marconi Union",
      album: "Weightless",
      spotifyId: "0t3ZvGKlmYmVsDzBJAXK8C",
      // Using embedded base64 audio data
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273f71b02b19a8e421dfa201fdc"
    },
    {
      name: "Experience",
      artist: "Ludovico Einaudi",
      album: "In A Time Lapse",
      spotifyId: "1BncfTJAWxrsxyT9culBrj",
      // Using embedded base64 audio data
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e55348c4e0879d6bedf4c718"
    },
    {
      name: "Clair de Lune",
      artist: "Claude Debussy",
      album: "Relaxing Piano",
      spotifyId: "2k5y9TVauVAG0LXn5mJHQz",
      // Using embedded base64 audio data
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b2737dfc3a9e31a7d7cad7869e29"
    },
    {
      name: "River Flows In You",
      artist: "Yiruma",
      album: "Piano Recital: Yiruma",
      spotifyId: "2bjwRfXMk4uRgOD9IBYl9h",
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273b7ca2c198f05561c651614d5"
    },
    {
      name: "Ocean Eyes",
      artist: "Billie Eilish",
      album: "Ocean Eyes",
      spotifyId: "1JLrQmodMSE0Oz2EgRTI6s",
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e9c6c2d416bce01ddc16c4b6"
    },
    {
      name: "Gymnopédie No. 1",
      artist: "Erik Satie",
      album: "Gymnopédies",
      spotifyId: "4qnBDLSEXI6xJVRg9PaAWs",
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b2734cb46f3ab88a80e403ee68a7"
    },
    {
      name: "Moonlight Sonata",
      artist: "Ludwig van Beethoven",
      album: "Classical Piano",
      spotifyId: "1BZG99C7Co1r6QUC3zaS59",
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b2734ad7b4bf6ff6ba86f83a3c77"
    },
    {
      name: "Ambient 1/Music For Airports: 2/1",
      artist: "Brian Eno",
      album: "Ambient 1: Music for Airports",
      spotifyId: "2etHQJxIbV0IiPWUMzY504",
      previewUrl: calmAudio,
      albumArt: "https://i.scdn.co/image/ab67616d0000b27331f8cf3659aec140e1f54290"
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
          throw new Error('Invalid API response format');
        }
        
        // Set the tracks from the API response
        setTracks(processedTracks);
      } catch (error) {
        console.error('API error:', error);
        throw error;
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