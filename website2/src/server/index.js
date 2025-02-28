import express from 'express';
import dotenv from 'dotenv';
import { GroqClient } from '../lib/groq-client.js';
import { logger } from '../lib/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Initialize the Groq client
const groqClient = new GroqClient({
  apiKey: process.env.GROQ_API_KEY,
  maxTokensPerMinute: parseInt(process.env.MAX_TOKENS_PER_MINUTE || '90000', 10)
});

// Enhanced prompt template
const enhancePrompt = (prompt) => {
  return `${prompt}

Please provide a complete, production-ready website with the following:

1. Clean, semantic HTML5 structure
2. Modern CSS with responsive design (mobile-first approach)
3. Interactive JavaScript functionality
4. Smooth animations and transitions
5. Optimized performance
6. Accessibility features
7. Cross-browser compatibility

Format your response with code blocks for each file:
\`\`\`html
<!-- index.html content here -->
\`\`\`

\`\`\`css
/* styles.css content here */
\`\`\`

\`\`\`javascript
// script.js content here
\`\`\`

Ensure all code is well-commented and follows best practices.`;
};

// API routes
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    logger.info('Generating website code from prompt');
    
    // Enhance the prompt with additional instructions
    const enhancedPrompt = enhancePrompt(prompt);
    
    const completion = await groqClient.generateCompletion({
      prompt: enhancedPrompt,
      model: 'qwen-2.5-coder-32b',
      temperature: 0.7, // Slightly increased for more creativity
      maxCompletionTokens: 4096,
      topP: 0.95
    });
    
    res.json({ completion });
  } catch (error) {
    logger.error('Error generating website:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});