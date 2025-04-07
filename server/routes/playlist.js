const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { 
  spotifyApiLimiter, 
  getRecommendations, 
  createPlaylist, 
  addTracksToPlaylist,
  getTrack,
  getAudioFeatures
} = require('../services/spotify');
const User = require('../models/User');

// Create a new playlist based on mood
router.post('/create', [
  auth,
  spotifyApiLimiter,
  validate.createPlaylist
], async (req, res) => {
  try {
    const { name, tracks, mood } = req.body;
    const userId = req.user.id;

    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { musicPreferences } = user.preferences || {};

    // Create playlist with user preferences
    const playlistParams = {
      name,
      userId,
      tracks,
      mood,
      ...musicPreferences
    };

    const playlist = await createPlaylist(playlistParams);

    res.json({
      playlistId: playlist.id,
      name: playlist.name,
      tracks: playlist.tracks,
      externalUrl: playlist.external_urls.spotify
    });

  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ 
      error: 'Failed to create playlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add tracks to existing playlist
router.post('/tracks', [
  auth,
  spotifyApiLimiter,
  validate.addTrack
], async (req, res) => {
  try {
    const { playlistId, trackIds } = req.body;
    const userId = req.user.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add tracks to playlist
    const result = await addTracksToPlaylist(playlistId, trackIds);

    res.json({
      message: 'Tracks added successfully',
      addedTracks: result.tracks
    });

  } catch (error) {
    console.error('Add tracks error:', error);
    res.status(500).json({ error: 'Failed to add tracks to playlist' });
  }
});

// Get track recommendations based on mood
router.get('/recommendations', [
  auth,
  spotifyApiLimiter
], async (req, res) => {
  try {
    const { mood, limit = 20 } = req.query;
    const userId = req.user.id;

    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { musicPreferences } = user.preferences || {};

    // Get recommendations with user preferences
    const recommendations = await getRecommendations({
      mood,
      limit,
      ...musicPreferences
    });

    res.json(recommendations);

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get track recommendations' });
  }
});

// Get track details with audio features
router.get('/track/:trackId', [
  auth,
  spotifyApiLimiter
], async (req, res) => {
  try {
    const { trackId } = req.params;

    // Get track details and audio features in parallel
    const [track, audioFeatures] = await Promise.all([
      getTrack(trackId),
      getAudioFeatures(trackId)
    ]);

    res.json({
      ...track,
      audioFeatures
    });

  } catch (error) {
    console.error('Get track details error:', error);
    res.status(500).json({ error: 'Failed to get track details' });
  }
});

// Update user music preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      genres,
      excludedGenres,
      minTempo,
      maxTempo,
      minEnergy,
      maxEnergy,
      minValence,
      maxValence
    } = req.body;

    // Validate numeric ranges
    const validateRange = (min, max, field) => {
      if (min !== undefined && max !== undefined && min > max) {
        throw new Error(`Invalid range for ${field}: min cannot be greater than max`);
      }
    };

    validateRange(minTempo, maxTempo, 'tempo');
    validateRange(minEnergy, maxEnergy, 'energy');
    validateRange(minValence, maxValence, 'valence');

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      userId,
      {
        'preferences.musicPreferences': {
          genres: genres || [],
          excludedGenres: excludedGenres || [],
          minTempo,
          maxTempo,
          minEnergy,
          maxEnergy,
          minValence,
          maxValence
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      preferences: user.preferences.musicPreferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      error: 'Failed to update music preferences',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 