const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  mood: {
    keywords: [String],
    sentiment: Number,
    originalText: String
  },
  tracks: [{
    spotifyId: String,
    name: String,
    artist: String,
    album: String,
    albumArt: String,
    previewUrl: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  weather: {
    condition: String,
    temperature: Number
  },
  timeOfDay: String,
  colorScheme: {
    primary: String,
    secondary: String,
    text: String
  }
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

module.exports = Playlist; 