const SpotifyWebApi = require('spotify-web-api-node');
const rateLimit = require('express-rate-limit');

// Rate limiter for Spotify API calls
const spotifyApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many Spotify API requests, please try again later'
});

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Token management
let tokenData = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

// Refresh token before it expires
const refreshTokenIfNeeded = async () => {
  try {
    if (!tokenData.accessToken || Date.now() >= tokenData.expiresAt) {
      if (tokenData.refreshToken) {
        // Use refresh token if available
        spotifyApi.setRefreshToken(tokenData.refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        updateTokenData(data.body);
      } else {
        // Get new client credentials token
        const data = await spotifyApi.clientCredentialsGrant();
        updateTokenData(data.body);
      }
    }
    return tokenData.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh Spotify token');
  }
};

// Update token data
const updateTokenData = (data) => {
  tokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokenData.refreshToken,
    expiresAt: Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety
  };
  spotifyApi.setAccessToken(tokenData.accessToken);
};

// Get track recommendations based on seed tracks and audio features
const getRecommendations = async (params) => {
  try {
    await refreshTokenIfNeeded();
    
    // Validate and sanitize parameters
    const validatedParams = {
      limit: Math.min(parseInt(params.limit) || 20, 50), // Max 50 tracks
      market: params.market || 'US',
      seed_genres: Array.isArray(params.seed_genres) ? params.seed_genres.slice(0, 5) : [], // Max 5 seeds
      min_valence: parseFloat(params.min_valence) || undefined,
      max_valence: parseFloat(params.max_valence) || undefined,
      target_valence: parseFloat(params.target_valence) || undefined,
      min_energy: parseFloat(params.min_energy) || undefined,
      max_energy: parseFloat(params.max_energy) || undefined,
      target_energy: parseFloat(params.target_energy) || undefined,
      min_tempo: parseFloat(params.min_tempo) || undefined,
      max_tempo: parseFloat(params.max_tempo) || undefined,
      target_tempo: parseFloat(params.target_tempo) || undefined,
      min_instrumentalness: parseFloat(params.min_instrumentalness) || undefined,
      max_instrumentalness: parseFloat(params.max_instrumentalness) || undefined,
      target_instrumentalness: parseFloat(params.target_instrumentalness) || undefined
    };
    
    // Remove undefined values
    Object.keys(validatedParams).forEach(key => 
      validatedParams[key] === undefined && delete validatedParams[key]
    );
    
    const response = await spotifyApi.getRecommendations(validatedParams);
    
    return response.body.tracks.map(track => ({
      spotifyId: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify
    }));
    
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw new Error('Failed to get Spotify recommendations');
  }
};

// Get track details by ID
const getTrack = async (trackId) => {
  try {
    await refreshTokenIfNeeded();
    
    // Validate track ID format
    if (!/^[0-9A-Za-z]{22}$/.test(trackId)) {
      throw new Error('Invalid Spotify track ID format');
    }
    
    const response = await spotifyApi.getTrack(trackId);
    const track = response.body;
    
    return {
      spotifyId: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      duration: track.duration_ms,
      popularity: track.popularity
    };
    
  } catch (error) {
    console.error('Error getting track:', error);
    throw new Error('Failed to get track details');
  }
};

// Search tracks
const searchTracks = async (query, limit = 20) => {
  try {
    await refreshTokenIfNeeded();
    
    // Validate and sanitize parameters
    const sanitizedQuery = query.replace(/[^\w\s]/gi, '').trim();
    const validLimit = Math.min(parseInt(limit) || 20, 50);
    
    if (!sanitizedQuery) {
      throw new Error('Invalid search query');
    }
    
    const response = await spotifyApi.searchTracks(sanitizedQuery, {
      limit: validLimit,
      market: 'US'
    });
    
    return response.body.tracks.items.map(track => ({
      spotifyId: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify
    }));
    
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw new Error('Failed to search tracks');
  }
};

// Get audio features for a track
const getAudioFeatures = async (trackId) => {
  try {
    await refreshTokenIfNeeded();
    
    // Validate track ID format
    if (!/^[0-9A-Za-z]{22}$/.test(trackId)) {
      throw new Error('Invalid Spotify track ID format');
    }
    
    const response = await spotifyApi.getAudioFeaturesForTrack(trackId);
    
    return {
      ...response.body,
      trackId
    };
    
  } catch (error) {
    console.error('Error getting audio features:', error);
    throw new Error('Failed to get audio features');
  }
};

// Create a playlist
const createPlaylist = async (userId, name, description = '', isPublic = true) => {
  try {
    await refreshTokenIfNeeded();
    
    // Validate parameters
    if (!userId || !name) {
      throw new Error('User ID and playlist name are required');
    }
    
    const response = await spotifyApi.createPlaylist(userId, {
      name: name.trim(),
      description: description.trim(),
      public: isPublic
    });
    
    return {
      id: response.body.id,
      name: response.body.name,
      description: response.body.description,
      public: response.body.public,
      externalUrl: response.body.external_urls.spotify
    };
    
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw new Error('Failed to create playlist');
  }
};

// Add tracks to a playlist
const addTracksToPlaylist = async (playlistId, trackIds) => {
  try {
    await refreshTokenIfNeeded();
    
    // Validate parameters
    if (!playlistId || !Array.isArray(trackIds) || trackIds.length === 0) {
      throw new Error('Playlist ID and track IDs are required');
    }
    
    // Validate track ID format and create URIs
    const trackUris = trackIds
      .filter(id => /^[0-9A-Za-z]{22}$/.test(id))
      .map(id => `spotify:track:${id}`);
    
    if (trackUris.length === 0) {
      throw new Error('No valid track IDs provided');
    }
    
    const response = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    
    return {
      snapshot_id: response.body.snapshot_id,
      added: trackUris.length
    };
    
  } catch (error) {
    console.error('Error adding tracks to playlist:', error);
    throw new Error('Failed to add tracks to playlist');
  }
};

module.exports = {
  spotifyApi,
  spotifyApiLimiter,
  refreshTokenIfNeeded,
  getRecommendations,
  getTrack,
  searchTracks,
  getAudioFeatures,
  createPlaylist,
  addTracksToPlaylist
}; 