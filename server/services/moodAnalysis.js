const natural = require('natural');
const SpotifyWebApi = require('spotify-web-api-node');
const rateLimit = require('express-rate-limit');
const { sanitizeInput } = require('../middleware/validate');

// Initialize Natural's sentiment analyzer
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

// Rate limiter for mood analysis
const moodAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many mood analysis requests, please try again later'
});

// Spotify API configuration
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Cache for Spotify tokens to reduce API calls
let spotifyToken = null;
let tokenExpiryTime = null;

// Refresh Spotify token if needed
const ensureSpotifyToken = async () => {
  if (!spotifyToken || Date.now() >= tokenExpiryTime) {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyToken = data.body['access_token'];
      tokenExpiryTime = Date.now() + (data.body['expires_in'] * 1000) - 60000; // Subtract 1 minute for safety
      spotifyApi.setAccessToken(spotifyToken);
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      throw new Error('Failed to refresh Spotify token');
    }
  }
  return spotifyToken;
};

// Mood keywords and their associated Spotify parameters
const moodMappings = {
  happy: {
    valence: { min: 0.7 },
    energy: { min: 0.6 },
    genres: ['pop', 'dance', 'happy']
  },
  sad: {
    valence: { max: 0.3 },
    energy: { max: 0.4 },
    genres: ['sad', 'acoustic', 'piano']
  },
  energetic: {
    energy: { min: 0.8 },
    tempo: { min: 120 },
    genres: ['dance', 'electronic', 'workout']
  },
  calm: {
    energy: { max: 0.4 },
    instrumentalness: { min: 0.3 },
    genres: ['ambient', 'chill', 'sleep']
  },
  focused: {
    energy: { target: 0.5 },
    instrumentalness: { min: 0.3 },
    genres: ['focus', 'study', 'classical']
  }
};

// Extract mood keywords from text
const extractMoodKeywords = (text) => {
  // Sanitize input
  const sanitizedText = sanitizeInput(text);
  
  // Tokenize and normalize text
  const tokens = tokenizer.tokenize(sanitizedText.toLowerCase());
  
  // Define mood keyword patterns
  const moodPatterns = {
    happy: /\b(happy|joy|excited|cheerful|good|great|positive)\b/,
    sad: /\b(sad|depressed|gloomy|melancholy|down|unhappy)\b/,
    energetic: /\b(energetic|active|energized|pumped|motivated|energy)\b/,
    calm: /\b(calm|peaceful|relaxed|chill|tranquil|mellow)\b/,
    focused: /\b(focused|productive|concentration|study|work)\b/
  };
  
  // Find matching moods
  const detectedMoods = Object.entries(moodPatterns)
    .filter(([_, pattern]) => pattern.test(sanitizedText))
    .map(([mood]) => mood);
  
  return detectedMoods.length > 0 ? detectedMoods : ['neutral'];
};

// Analyze sentiment of text
const analyzeSentiment = (text) => {
  // Sanitize input
  const sanitizedText = sanitizeInput(text);
  
  // Tokenize text
  const tokens = tokenizer.tokenize(sanitizedText);
  
  // Get sentiment score
  const score = analyzer.getSentiment(tokens);
  
  return {
    score,
    magnitude: Math.abs(score),
    label: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'
  };
};

// Get Spotify recommendations based on mood
const getSpotifyRecommendations = async (moodKeywords, sentiment) => {
  try {
    await ensureSpotifyToken();
    
    // Get parameters for primary mood
    const primaryMood = moodKeywords[0];
    const moodParams = moodMappings[primaryMood] || {};
    
    // Build recommendation parameters
    const params = {
      limit: 10,
      market: 'US',
      seed_genres: moodParams.genres || ['pop'],
      ...moodParams.valence,
      ...moodParams.energy,
      ...moodParams.tempo,
      ...moodParams.instrumentalness
    };
    
    // Adjust parameters based on sentiment
    if (sentiment.score > 0.6) {
      params.min_valence = 0.7;
    } else if (sentiment.score < -0.3) {
      params.max_valence = 0.3;
    }
    
    // Get recommendations from Spotify
    const response = await spotifyApi.getRecommendations(params);
    
    // Format tracks
    return response.body.tracks.map(track => ({
      spotifyId: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url
    })).filter(track => track.previewUrl);
    
  } catch (error) {
    console.error('Error getting Spotify recommendations:', error);
    throw new Error('Failed to get music recommendations');
  }
};

// Main mood analysis function
const analyzeMood = async (text) => {
  try {
    // Input validation
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input text');
    }
    
    // Extract mood keywords
    const moodKeywords = extractMoodKeywords(text);
    
    // Analyze sentiment
    const sentiment = analyzeSentiment(text);
    
    // Get music recommendations
    const tracks = await getSpotifyRecommendations(moodKeywords, sentiment);
    
    return {
      mood: {
        keywords: moodKeywords,
        sentiment,
        originalText: text
      },
      tracks: tracks.slice(0, 8) // Limit to 8 tracks
    };
    
  } catch (error) {
    console.error('Mood analysis error:', error);
    throw error;
  }
};

module.exports = {
  analyzeMood,
  moodAnalysisLimiter
}; 