# MoodMix

MoodMix is a mood-based music recommendation application that analyzes your text input to determine your mood and suggests music that matches your emotional state. Built with React, Node.js, Express, MongoDB, and the Spotify API.

## Features

- **Mood Analysis**: Uses natural language processing to analyze text and determine your current mood
- **Personalized Music Recommendations**: Recommends music based on your mood using the Spotify API
- **Custom Playlists**: Create and save mood-based playlists to your Spotify account
- **User Accounts**: Register and login to save your mood history and favorite playlists
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes

## Tech Stack

- **Frontend**: React, Material-UI, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Natural Language Processing**: Natural.js
- **Music API**: Spotify Web API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB Atlas account (or local MongoDB installation)
- Spotify Developer account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/moodmix.git
   cd moodmix
   ```

2. Install all dependencies (client and server):
   ```
   npm run install-all
   ```

   This will install dependencies for the root project, client, and server.

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

4. Start both the client and server in development mode:
   ```
   npm run dev
   ```

   This will start the server on port 5001 and the client on port 3000.

5. Open your browser and navigate to `http://localhost:3000`

### Running in Production Mode

To build and run the application in production mode:

1. Build the client:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

### Troubleshooting

If you encounter port conflicts:

- For the server, modify the PORT value in your .env file
- For the client, use: `PORT=3001 npm start` to run on a different port

## Deployment

### Preparing for GitHub

1. Before pushing to GitHub, ensure all sensitive information is properly secured:
   ```
   # Make sure your .env file is in .gitignore
   echo ".env" >> .gitignore
   ```

2. Verify your code doesn't contain hardcoded credentials or API keys.

3. Push your code to GitHub:
   ```
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Deploying to Vercel

1. Create a Vercel account if you don't already have one: [https://vercel.com/signup](https://vercel.com/signup)

2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Login to Vercel from the command line:
   ```
   vercel login
   ```

4. Deploy the application from the root directory:
   ```
   vercel
   ```

5. Follow the prompts to link your GitHub repository and configure your project:
   - Set your project name
   - Confirm the root directory
   - Set your environment variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `SPOTIFY_CLIENT_ID`
     - `SPOTIFY_CLIENT_SECRET`
     - `SPOTIFY_REDIRECT_URI` (update this to your Vercel deployment URL)

6. For production deployment, use:
   ```
   vercel --prod
   ```

7. After deployment, update your Spotify Developer Dashboard with your new Vercel URL as an authorized redirect URI.

### Environment Variables for Vercel

Ensure the following environment variables are set in your Vercel project:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `SPOTIFY_CLIENT_ID`: Your Spotify API client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify API client secret
- `SPOTIFY_REDIRECT_URI`: Your redirect URI for Spotify authentication
- `NODE_ENV`: Set to 'production' for production deployment

## API Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `POST /api/mood/analyze`: Analyze text for mood
- `GET /api/playlists`: Get user's saved playlists
- `POST /api/playlists`: Save a new playlist
- `POST /api/spotify/recommendations`: Get music recommendations from Spotify

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Material-UI](https://mui.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 