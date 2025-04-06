// Mock data for development and testing when MongoDB is unavailable

const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2023-01-01')
  },
  {
    id: '2',
    username: 'demouser',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date('2023-01-02')
  }
];

const mockPlaylists = [
  {
    id: '101',
    name: 'Happy Vibes',
    userId: '1',
    spotifyId: 'spotify:playlist:37i9dQZF1DXdPec7aLTmlC',
    tracks: [
      { name: 'Happy', artist: 'Pharrell Williams', spotifyUri: 'spotify:track:60nZcImufyMA1MKQY3dcCH' },
      { name: 'Good Feeling', artist: 'Flo Rida', spotifyUri: 'spotify:track:2LEF1A8DOZ9wRYikWgVlZ8' },
      { name: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', spotifyUri: 'spotify:track:32OlwWuMpZ6b0aN2RZOeMS' }
    ],
    mood: 'happy',
    createdAt: new Date('2023-02-15')
  },
  {
    id: '102',
    name: 'Chill Study Session',
    userId: '1',
    spotifyId: 'spotify:playlist:37i9dQZF1DX8NTLI2TtZa6',
    tracks: [
      { name: 'Lo-fi Hip Hop', artist: 'Chillhop Music', spotifyUri: 'spotify:track:0bXpmJyHHYPk6QBFj25bYF' },
      { name: 'Dreamland', artist: 'Chilled Cow', spotifyUri: 'spotify:track:6SpLc7EXZIPpy0sVko0aoU' },
      { name: 'Midnight', artist: 'Joakim Karud', spotifyUri: 'spotify:track:6TltUzpPzTW2xPmOqGJbiV' }
    ],
    mood: 'focused',
    createdAt: new Date('2023-03-10')
  },
  {
    id: '103',
    name: 'Rainy Day Blues',
    userId: '2',
    spotifyId: 'spotify:playlist:37i9dQZF1DXbm6HfkbMtFZ',
    tracks: [
      { name: 'Rainy Days', artist: 'Real Estate', spotifyUri: 'spotify:track:1PRLOxme9UkuJ1tXcYYzUh' },
      { name: 'Coffee', artist: 'beabadoobee', spotifyUri: 'spotify:track:54FlkjDsPrPGfYQlGFQKiQ' },
      { name: 'Lemon Boy', artist: 'Cavetown', spotifyUri: 'spotify:track:0ZTjo2BjVAicpu6LRusfeg' }
    ],
    mood: 'melancholy',
    createdAt: new Date('2023-04-05')
  }
];

const mockMoodAnalysis = [
  {
    id: '201',
    userId: '1',
    text: 'I feel so happy and energetic today! Ready to take on the world.',
    keywords: ['happy', 'energetic'],
    sentiment: 0.8,
    createdAt: new Date('2023-05-15')
  },
  {
    id: '202',
    userId: '1',
    text: 'Feeling a bit down today, the weather is so gloomy and I miss my friends.',
    keywords: ['sad', 'down'],
    sentiment: -0.4,
    createdAt: new Date('2023-05-20')
  },
  {
    id: '203',
    userId: '2',
    text: 'Need to focus on my studies, looking for some concentration music.',
    keywords: ['focused', 'concentration'],
    sentiment: 0.2,
    createdAt: new Date('2023-06-01')
  }
];

module.exports = {
  users: mockUsers,
  playlists: mockPlaylists,
  moodAnalysis: mockMoodAnalysis
}; 