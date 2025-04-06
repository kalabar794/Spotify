# Deploying MoodMix to Vercel

This guide will help you deploy the MoodMix application to Vercel.

## Prerequisites

1. Create a [Vercel account](https://vercel.com/signup) (you can sign up with GitHub)
2. Install the Vercel CLI: `npm i -g vercel`
3. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)

## Setting up MongoDB Atlas

1. Sign up for MongoDB Atlas
2. Create a new project
3. Build a free tier cluster
4. When the cluster is ready, click "Connect"
5. Select "Connect your application"
6. Copy the connection string (looks like `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
7. Replace `<password>` with your MongoDB password

## Configuring Environment Variables in Vercel

You need to add your environment variables to Vercel. You can do this either through the dashboard or using the CLI:

### Using Vercel Dashboard

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" tab
3. Add the following variables:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure string for JWT token encryption
- `SPOTIFY_CLIENT_ID` - Your Spotify API client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify API client secret
- `SPOTIFY_REDIRECT_URI` - The redirect URI for Spotify authentication

### Using Vercel CLI

```bash
vercel secrets add mongodb-uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/moodmix"
vercel secrets add jwt-secret "your-secret-key"
vercel secrets add spotify-client-id "your-spotify-client-id"
vercel secrets add spotify-client-secret "your-spotify-client-secret"
vercel secrets add spotify-redirect-uri "https://your-vercel-app.vercel.app/callback"
```

## Deploying to Vercel

1. Make sure you are in the root directory of your project
2. Login to Vercel CLI: `vercel login`
3. Deploy your application: `vercel --prod`

The CLI will guide you through the deployment process. It will detect that you have a `vercel.json` file and use it for configuration.

## Post-Deployment

After deployment, you should:

1. Update the Spotify redirect URI in your Spotify Developer Dashboard to match your Vercel app URL
2. Test the application to ensure everything works correctly

## Troubleshooting

If you encounter issues with your deployment:

1. Check the Vercel deployment logs
2. Ensure all environment variables are correctly set
3. Verify that your MongoDB Atlas cluster is accessible from Vercel's IP addresses (you may need to allow access from all IPs by setting Network Access to 0.0.0.0/0)
4. Make sure your Spotify app has the correct redirect URI

## Continuous Deployment

Vercel supports continuous deployment from GitHub. To set it up:

1. Push your code to a GitHub repository
2. Connect your Vercel account to GitHub
3. Import your repository from the Vercel dashboard
4. Configure the build settings and environment variables

With this setup, every push to your main branch will trigger a new deployment.

## Custom Domain

To use a custom domain with your Vercel deployment:

1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Domains" tab
3. Add your domain
4. Follow the instructions to configure your DNS settings 