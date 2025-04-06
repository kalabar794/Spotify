const express = require('express');
const router = express.Router();
const moodAnalysisService = require('../services/moodAnalysis');
const SpotifyWebApi = require('spotify-web-api-node');
const mockData = require('../mockData');

// Check if we're in mock mode (defined in server.js)
const isMockMode = () => {
  // Always use Spotify API, never use mock data
  return false;
};

// Analyze mood from text
router.post('/analyze', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text input is required' });
    }
    
    const moodAnalysis = moodAnalysisService.analyzeMood(text);
    
    // If we're in mock mode, add a note to the response
    if (isMockMode()) {
      moodAnalysis.mockMode = true;
      moodAnalysis.note = "Using mock data mode - MongoDB connection unavailable";
    }
    
    res.json(moodAnalysis);
  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ message: 'Error analyzing mood' });
  }
});

// Get recommendations based on mood
router.post('/recommendations', async (req, res) => {
  try {
    const { moodKeywords, sentiment } = req.body;
    
    if (!moodKeywords || !Array.isArray(moodKeywords) || moodKeywords.length === 0) {
      return res.status(400).json({ message: 'Mood keywords are required' });
    }
    
    // If in mock mode, return mock playlist data
    if (isMockMode()) {
      console.log('Using mock data for recommendations');
      
      // Get a mock playlist that matches one of the mood keywords if possible
      let mockPlaylist = mockData.playlists.find(p => 
        moodKeywords.some(keyword => p.mood.includes(keyword))
      ) || mockData.playlists[0]; // Default to first playlist if no match
      
      const mockTracks = mockPlaylist.tracks.map(track => ({
        spotifyId: track.spotifyUri.split(':')[2],
        name: track.name,
        artist: track.artist,
        album: 'Mock Album',
        albumArt: 'https://via.placeholder.com/300',
        previewUrl: null
      }));
      
      return res.json({
        tracks: mockTracks,
        mockMode: true,
        note: "Using mock data mode - MongoDB connection unavailable"
      });
    }
    
    // Continue with normal Spotify API if not in mock mode
    
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });

    // Get access token
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    
    // Map mood to Spotify parameters
    const params = mapMoodToSpotifyParams(moodKeywords, sentiment);
    
    // Get recommendations
    const recommendations = await spotifyApi.getRecommendations(params);
    
    // Format response
    const formattedTracks = recommendations.body.tracks.map(track => ({
      spotifyId: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url
    }));
    
    res.json(formattedTracks);
  } catch (error) {
    console.error('Recommendation error:', error);
    
    // If there's an error with Spotify API, fall back to mock data
    console.log('Falling back to mock data due to error');
    const mockTracks = mockData.playlists[0].tracks.map(track => ({
      spotifyId: track.spotifyUri.split(':')[2],
      name: track.name,
      artist: track.artist,
      album: 'Mock Album (Error Fallback)',
      albumArt: 'https://via.placeholder.com/300',
      previewUrl: null
    }));
    
    res.json({
      tracks: mockTracks,
      mockMode: true,
      error: 'Error connecting to Spotify API, using mock data',
      note: "Using mock data mode due to Spotify API error"
    });
  }
});

// Helper function to map mood to Spotify parameters
function mapMoodToSpotifyParams(moodKeywords, sentiment) {
  let params = {
    limit: 20,
    seed_genres: []
  };
  
  // Default happy parameters
  if (sentiment > 0.5) {
    params.min_energy = 0.6;
    params.min_valence = 0.6;
    params.seed_genres = ['pop', 'happy', 'dance'];
  } 
  // Default sad parameters
  else if (sentiment < 0) {
    params.max_energy = 0.4;
    params.max_valence = 0.4;
    params.seed_genres = ['sad', 'acoustic', 'piano'];
  } 
  // Default neutral parameters
  else {
    params.target_energy = 0.5;
    params.target_valence = 0.5;
    params.seed_genres = ['rock', 'indie', 'pop'];
  }
  
  // Adjust based on specific keywords
  moodKeywords.forEach(keyword => {
    switch(keyword) {
      case 'energetic':
      case 'excited':
      case 'happy':
        params.min_energy = 0.7;
        params.min_valence = 0.7;
        params.seed_genres = ['dance', 'pop', 'edm'];
        break;
      case 'calm':
      case 'relaxed':
      case 'peaceful':
        params.max_energy = 0.4;
        params.target_valence = 0.5;
        params.seed_genres = ['ambient', 'chill', 'acoustic'];
        break;
      case 'sad':
      case 'depressed':
      case 'melancholy':
        params.max_energy = 0.4;
        params.max_valence = 0.3;
        params.seed_genres = ['sad', 'acoustic', 'piano'];
        break;
      case 'angry':
      case 'frustrated':
        params.min_energy = 0.6;
        params.max_valence = 0.4;
        params.seed_genres = ['rock', 'metal', 'punk'];
        break;
      case 'focused':
      case 'productive':
        params.target_energy = 0.5;
        params.max_valence = 0.6;
        params.seed_genres = ['focus', 'instrumental', 'electronic'];
        break;
      case 'romantic':
        params.target_energy = 0.5;
        params.target_valence = 0.7;
        params.seed_genres = ['romance', 'soul', 'jazz'];
        break;
      case 'nostalgic':
        params.target_energy = 0.4;
        params.target_valence = 0.4;
        params.seed_genres = ['oldies', 'vintage', 'folk'];
        break;
    }
  });
  
  return params;
}

module.exports = router; 