const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Keywords associated with different moods
const moodKeywords = {
  happy: ['happy', 'joy', 'ecstatic', 'cheerful', 'excited', 'delighted', 'pleased', 'thrilled', 'blissful', 'content', 'good', 'great', 'wonderful', 'fantastic', 'positive'],
  sad: ['sad', 'depressed', 'unhappy', 'melancholy', 'gloomy', 'miserable', 'down', 'blue', 'heartbroken', 'somber', 'upset', 'hurt', 'disappointed'],
  angry: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'enraged', 'hostile', 'bitter', 'frustrated', 'outraged', 'rage', 'hate', 'upset'],
  calm: ['calm', 'peaceful', 'tranquil', 'relaxed', 'serene', 'mellow', 'chill', 'quiet', 'gentle', 'soothing', 'relax', 'peaceful', 'zen'],
  energetic: ['energetic', 'lively', 'active', 'dynamic', 'vibrant', 'spirited', 'peppy', 'upbeat', 'vigorous', 'animated', 'energy', 'energic', 'pumped', 'motivated', 'hype'],
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'uneasy', 'tense', 'restless', 'agitated', 'concerned', 'apprehensive', 'anxiety', 'fear', 'scared'],
  romantic: ['romantic', 'love', 'passionate', 'intimate', 'affectionate', 'tender', 'warm', 'sensual', 'dreamy', 'adoring', 'loving', 'romance'],
  nostalgic: ['nostalgic', 'reminiscent', 'sentimental', 'yearning', 'wistful', 'longing', 'memories', 'remembering', 'retrospective', 'reflective', 'nostalgia', 'remember'],
  focused: ['focused', 'concentrate', 'attentive', 'determined', 'productive', 'studious', 'mindful', 'diligent', 'dedicated', 'committed', 'focus', 'concentration']
};

// Stemmed mood keywords for better matching
const stemmedMoodKeywords = {};
Object.keys(moodKeywords).forEach(mood => {
  stemmedMoodKeywords[mood] = moodKeywords[mood].map(word => stemmer.stem(word));
});

// Simple sentiment analysis function
function analyzeSentiment(text) {
  const analyzer = new natural.SentimentAnalyzer('English', stemmer, 'afinn');
  const tokens = tokenizer.tokenize(text);
  return analyzer.getSentiment(tokens);
}

// Extract mood keywords from text
function extractMoodKeywords(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  
  const foundMoods = [];
  
  // Check each mood category
  Object.keys(stemmedMoodKeywords).forEach(mood => {
    const moodStemmedWords = stemmedMoodKeywords[mood];
    
    // Check if any of the stemmed tokens match the mood keywords
    const matched = stemmedTokens.some(token => 
      moodStemmedWords.includes(token)
    );
    
    if (matched) {
      foundMoods.push(mood);
    }
  });
  
  // Also check for direct string includes for partial matches
  if (foundMoods.length === 0) {
    const lowerText = text.toLowerCase();
    
    // Check common word variants that might not stem correctly
    if (lowerText.includes('energ')) foundMoods.push('energetic');
    if (lowerText.includes('excit')) foundMoods.push('happy');
    if (lowerText.includes('joy')) foundMoods.push('happy');
    if (lowerText.includes('good')) foundMoods.push('happy');
    if (lowerText.includes('relax')) foundMoods.push('calm');
    if (lowerText.includes('sad')) foundMoods.push('sad');
    if (lowerText.includes('ang')) foundMoods.push('angry');
  }
  
  // If no moods found, infer from sentiment
  if (foundMoods.length === 0) {
    const sentiment = analyzeSentiment(text);
    if (sentiment > 0.3) {
      foundMoods.push('happy');
    } else if (sentiment < -0.3) {
      foundMoods.push('sad');
    } else {
      // For neutral sentiment, check the text for indicators
      const lowerText = text.toLowerCase();
      if (lowerText.includes('music') || lowerText.includes('listen') || lowerText.includes('song')) {
        foundMoods.push('focused'); // Assume focus if talking about music
      } else {
        foundMoods.push('calm'); // Default to calm
      }
    }
  }
  
  console.log('Extracted mood keywords:', foundMoods, 'from text:', text);
  return foundMoods;
}

// Generate color scheme based on mood
function generateColorScheme(moodKeywords, sentiment) {
  let colorScheme = {
    primary: '#6200ea',   // Default purple
    secondary: '#03dac6', // Default teal
    text: '#ffffff'       // Default white
  };
  
  // Happy colors
  if (moodKeywords.includes('happy') || moodKeywords.includes('energetic') || sentiment > 0.5) {
    colorScheme = {
      primary: '#ffab00',   // Amber
      secondary: '#ff6d00',  // Orange
      text: '#000000'       // Black
    };
  } 
  // Calm/relaxed colors
  else if (moodKeywords.includes('calm') || moodKeywords.includes('focused')) {
    colorScheme = {
      primary: '#0288d1',   // Light Blue
      secondary: '#26a69a',  // Teal
      text: '#ffffff'       // White
    };
  }
  // Sad colors
  else if (moodKeywords.includes('sad') || sentiment < -0.3) {
    colorScheme = {
      primary: '#0d47a1',   // Deep Blue
      secondary: '#263238',  // Blue Grey
      text: '#ffffff'       // White
    };
  }
  // Romantic colors
  else if (moodKeywords.includes('romantic')) {
    colorScheme = {
      primary: '#ad1457',   // Pink
      secondary: '#e91e63',  // Light Pink
      text: '#ffffff'       // White
    };
  }
  // Angry colors
  else if (moodKeywords.includes('angry')) {
    colorScheme = {
      primary: '#d50000',   // Red
      secondary: '#bf360c',  // Deep Orange
      text: '#ffffff'       // White
    };
  }
  // Nostalgic colors
  else if (moodKeywords.includes('nostalgic')) {
    colorScheme = {
      primary: '#4e342e',   // Brown
      secondary: '#8d6e63',  // Light Brown
      text: '#ffffff'       // White
    };
  }
  
  return colorScheme;
}

// Main function to analyze mood from text
function analyzeMood(text) {
  const sentiment = analyzeSentiment(text);
  const keywords = extractMoodKeywords(text);
  const colorScheme = generateColorScheme(keywords, sentiment);
  
  console.log('Analyzed mood:', { keywords, sentiment, originalText: text });
  return {
    keywords,
    sentiment,
    originalText: text,
    colorScheme
  };
}

module.exports = {
  analyzeMood,
  analyzeSentiment,
  extractMoodKeywords
}; 