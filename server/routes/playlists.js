const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user by id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all playlists for a user
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single playlist by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to access this playlist' });
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, mood, tracks, weather, timeOfDay, colorScheme } = req.body;
    
    if (!name || !tracks || !mood) {
      return res.status(400).json({ message: 'Name, tracks, and mood are required' });
    }
    
    const newPlaylist = new Playlist({
      name,
      description,
      mood,
      tracks,
      user: req.user._id,
      weather,
      timeOfDay,
      colorScheme
    });
    
    const savedPlaylist = await newPlaylist.save();
    
    // Add to user's saved playlists
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { savedPlaylists: savedPlaylist._id } }
    );
    
    res.status(201).json(savedPlaylist);
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a playlist
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Find playlist by ID
    let playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this playlist' });
    }
    
    // Update fields
    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;
    
    const updatedPlaylist = await playlist.save();
    
    res.json(updatedPlaylist);
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a playlist
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find playlist by ID
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if user owns the playlist
    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this playlist' });
    }
    
    // Remove playlist
    await playlist.remove();
    
    // Remove from user's saved playlists
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedPlaylists: req.params.id } }
    );
    
    res.json({ message: 'Playlist removed' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 