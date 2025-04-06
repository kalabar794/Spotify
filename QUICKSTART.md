# MoodMix Quick Start Guide

This guide will help you quickly set up and run the MoodMix application.

## Prerequisites

Before starting, make sure you have:

1. Node.js (v14 or later) installed
2. npm (v6 or later) installed
3. A Spotify Developer account with registered application
4. MongoDB Atlas account (optional for development)

## Getting Your Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Create a new application
4. Set the Redirect URI to `http://localhost:3000/callback`
5. Note your Client ID and Client Secret

## Quick Installation

1. Clone the repository and navigate to the project directory:
   ```
   git clone https://github.com/yourusername/moodmix.git
   cd moodmix
   ```

2. Install all dependencies:
   ```
   npm run install-all
   ```

3. Create a `.env` file in the `server` directory with:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```
   
   Note: For development without MongoDB, you can skip the MONGODB_URI. The app will run in mock data mode.

4. Start the development servers:
   ```
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## Troubleshooting

### Port Already in Use

If you see "Port 5001 is already in use":

1. Find the process using the port:
   ```
   # On macOS/Linux:
   lsof -i :5001
   
   # On Windows:
   netstat -ano | findstr :5001
   ```

2. Kill the process:
   ```
   # On macOS/Linux:
   kill -9 <PID>
   
   # On Windows:
   taskkill /PID <PID> /F
   ```

3. Or simply use a different port:
   ```
   # In server/.env:
   PORT=5002
   
   # Then update client/package.json proxy to match
   ```

### Spotify API Issues

If you see errors related to Spotify API:

1. Verify your credentials in the `.env` file
2. Check your Spotify Developer Dashboard to ensure your app is active
3. Confirm your redirect URI matches what's registered in Spotify Dashboard

### MongoDB Connection Issues

If MongoDB fails to connect:

1. Check your connection string in the `.env` file
2. Make sure your IP address is whitelisted in MongoDB Atlas
3. The app will automatically fall back to mock data mode, so you can still test functionality

## Running Tests

```
npm test
```

## Building for Production

```
npm run build
```

## Additional Help

For more detailed information, see the full [README.md](README.md) or [file an issue](https://github.com/yourusername/moodmix/issues) on our GitHub repository. 