const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { analyzeMood, moodAnalysisLimiter } = require('../services/moodAnalysis');
const { spotifyApiLimiter } = require('../services/spotify');
const User = require('../models/User');
const SpotifyWebApi = require('spotify-web-api-node');
const mockData = require('../mockData');

// Check if we're in mock mode (defined in server.js)
const isMockMode = () => {
  // Always use Spotify API, never use mock data
  return false;
};

// Analyze mood and get music recommendations
router.post('/analyze', [
  auth,
  moodAnalysisLimiter,
  spotifyApiLimiter,
  validate.analyzeMood
], async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    // Get user preferences (if any)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Analyze mood and get recommendations
    const result = await analyzeMood(text);

    // Store mood analysis in user history
    user.moodHistory = user.moodHistory || [];
    user.moodHistory.unshift({
      text,
      mood: result.mood,
      timestamp: Date.now()
    });

    // Keep only last 10 entries
    if (user.moodHistory.length > 10) {
      user.moodHistory = user.moodHistory.slice(0, 10);
    }

    await user.save();

    res.json(result);

  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ 
      error: 'Mood analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's mood history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      history: user.moodHistory || []
    });

  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({ error: 'Failed to get mood history' });
  }
});

// Delete mood history entry
router.delete('/history/:entryId', auth, async (req, res) => {
  try {
    const { entryId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find and remove the entry
    const entryIndex = user.moodHistory.findIndex(
      entry => entry._id.toString() === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    user.moodHistory.splice(entryIndex, 1);
    await user.save();

    res.json({ message: 'History entry deleted successfully' });

  } catch (error) {
    console.error('Delete mood history error:', error);
    res.status(500).json({ error: 'Failed to delete history entry' });
  }
});

// Clear all mood history
router.delete('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.moodHistory = [];
    await user.save();

    res.json({ message: 'Mood history cleared successfully' });

  } catch (error) {
    console.error('Clear mood history error:', error);
    res.status(500).json({ error: 'Failed to clear mood history' });
  }
});

// Get mood statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate mood statistics
    const stats = {
      totalEntries: user.moodHistory?.length || 0,
      moodDistribution: {},
      averageSentiment: 0,
      mostFrequentMood: null,
      timeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    };

    if (stats.totalEntries > 0) {
      // Calculate mood distribution and sentiment average
      let totalSentiment = 0;
      user.moodHistory.forEach(entry => {
        // Mood distribution
        entry.mood.keywords.forEach(keyword => {
          stats.moodDistribution[keyword] = (stats.moodDistribution[keyword] || 0) + 1;
        });

        // Sentiment average
        totalSentiment += entry.mood.sentiment.score;

        // Time of day distribution
        const hour = new Date(entry.timestamp).getHours();
        if (hour >= 5 && hour < 12) stats.timeOfDay.morning++;
        else if (hour >= 12 && hour < 17) stats.timeOfDay.afternoon++;
        else if (hour >= 17 && hour < 22) stats.timeOfDay.evening++;
        else stats.timeOfDay.night++;
      });

      // Calculate averages and most frequent mood
      stats.averageSentiment = totalSentiment / stats.totalEntries;
      stats.mostFrequentMood = Object.entries(stats.moodDistribution)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    res.json({ stats });

  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Failed to get mood statistics' });
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
    
    // Only include tracks with valid preview URLs
    const tracksWithPreviews = recommendations.body.tracks
      .filter(track => track.preview_url)
      .map(track => ({
        spotifyId: track.id,
        name: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        previewUrl: track.preview_url
      }));
    
    // Make sure we're sending at least 8 tracks if possible
    if (tracksWithPreviews.length >= 8) {
      res.json(tracksWithPreviews.slice(0, 8));
    } else {
      // Not enough tracks with previews, fall back to mock data to fill the gap
      console.log(`Only found ${tracksWithPreviews.length} tracks with previews, adding mock data`);
      // Import the generateMockTracks function from the server
      const generateMockTracks = require('../server').generateMockTracks;
      // Get mock tracks based on mood and sentiment
      const mockTracks = generateMockTracks(moodKeywords, sentiment).slice(0, 8 - tracksWithPreviews.length);
      res.json([...tracksWithPreviews, ...mockTracks]);
    }
  } catch (error) {
    console.error('Recommendation error:', error);
    
    // If there's an error with Spotify API, fall back to mock data
    console.log('Falling back to mock data due to error');
    
    // Import the generateMockTracks function from the server
    const generateMockTracks = require('../server').generateMockTracks;
    
    // Extract mood keywords and sentiment from request, or use defaults
    const { moodKeywords = ['happy'], sentiment = 0.5 } = req.body;
    
    // Generate appropriate mock tracks based on mood
    const mockTracks = generateMockTracks(moodKeywords, sentiment).slice(0, 8);
    
    res.json(mockTracks);
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