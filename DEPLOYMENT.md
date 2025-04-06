# MoodMix Deployment Guide

This guide will walk you through deploying the MoodMix application (React frontend and Node.js backend) on Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account with a cluster set up
3. [Spotify Developer](https://developer.spotify.com/dashboard/) account with an app created
4. [Git](https://git-scm.com/) installed on your local machine
5. [Node.js](https://nodejs.org/) (v14 or later) and npm installed on your local machine

## Step 1: Prepare Your MongoDB Atlas Database

1. Log in to your MongoDB Atlas account
2. Create a new cluster or use an existing one
3. Set up database access:
   - Create a database user with read/write permissions
   - Add your IP address to the IP access list (or allow access from anywhere for development)
4. Get your MongoDB connection string:
   - Go to "Clusters" > Click "Connect" > "Connect your application"
   - Copy the connection string, which should look like: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority`
   - Replace `<username>`, `<password>`, and `<dbname>` with your actual values

## Step 2: Configure Spotify API

1. Log in to your Spotify Developer Dashboard
2. Create a new app or use an existing one
3. Note down your Client ID and Client Secret
4. Set your Redirect URI (e.g., `https://your-app-name.vercel.app/callback`)

## Step 3: Prepare for Deployment

1. Ensure your server code is set up for serverless deployment:
   - The server code already includes the necessary changes for Vercel serverless functions
   - The `server.js` file exports the Express app for Vercel

2. Create a `vercel.json` file in the root directory with the following configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "SPOTIFY_CLIENT_ID": "@spotify-client-id",
    "SPOTIFY_CLIENT_SECRET": "@spotify-client-secret",
    "SPOTIFY_REDIRECT_URI": "@spotify-redirect-uri",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

3. Update the client's package.json:
   - Add a build script for Vercel: `"build": "react-scripts build"`
   - Add proxy for local development: `"proxy": "http://localhost:5000"`

## Step 4: Deploy to Vercel

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel from the CLI:
   ```
   vercel login
   ```

3. Set up environment variables on Vercel:
   - Use the Vercel CLI to set up environment variables securely:
   ```
   vercel secrets add mongodb-uri "your-mongodb-connection-string"
   vercel secrets add spotify-client-id "your-spotify-client-id"
   vercel secrets add spotify-client-secret "your-spotify-client-secret"
   vercel secrets add spotify-redirect-uri "https://your-app-name.vercel.app/callback"
   vercel secrets add jwt-secret "your-secure-jwt-secret"
   ```

4. Deploy the application:
   ```
   vercel
   ```

5. Follow the prompts to confirm deployment settings
   - Select your project when prompted
   - Choose the appropriate team if applicable
   - Set the project name (e.g., "moodmix")
   - Confirm deployment

6. Once deployment is complete, Vercel will provide you with a URL for your application. This URL can be used to access your deployed MoodMix application.

## Step 5: Configure Production Settings

1. Update the CORS settings in your server code to allow requests from your Vercel domain
2. Update the Spotify redirect URI in your Spotify Developer Dashboard to match your Vercel domain
3. Update the client-side API calls to use the production URL

## Troubleshooting

1. If your deployment fails, check the Vercel logs for specific error messages
2. Ensure all environment variables are correctly set
3. Check that your MongoDB Atlas cluster is accessible (whitelist Vercel IPs or allow access from anywhere)
4. Verify that your Spotify API credentials are correct

## Continuous Deployment

Vercel supports continuous deployment from GitHub, GitLab, or Bitbucket. To set up continuous deployment:

1. Push your code to a Git repository
2. Import the repository in the Vercel dashboard
3. Configure the same environment variables in the Vercel project settings
4. Vercel will automatically deploy when you push changes to your repository

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Spotify API Documentation](https://developer.spotify.com/documentation/web-api/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/) 