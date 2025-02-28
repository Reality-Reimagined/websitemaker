/**
 * Example: Code Generation with Groq Bolt
 * 
 * This example demonstrates how to use the Groq Bolt application
 * to generate code based on a description.
 */

import { GroqClient } from '../src/lib/groq-client.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function generateCode() {
  // Initialize the Groq client
  const groqClient = new GroqClient({
    apiKey: process.env.GROQ_API_KEY,
    maxTokensPerMinute: parseInt(process.env.MAX_TOKENS_PER_MINUTE || '90000', 10)
  });

  // Define the prompt for code generation
  const prompt = `
Write a Node.js function that:
1. Takes a URL as input
2. Fetches the content from that URL
3. Extracts all links (a href) from the HTML
4. Returns an array of unique links
5. Handles errors appropriately

Please include JSDoc comments and example usage.
`;

  try {
    // Generate the code
    const generatedCode = await groqClient.generateCompletion({
      prompt,
      model: 'qwen-2.5-coder-32b',
      temperature: 0.6,
      maxCompletionTokens: 2048,
      topP: 0.95,
      outputFile: 'examples/generated-link-extractor.js'
    });

    console.log('\nCode generation complete! Output saved to examples/generated-link-extractor.js');
  } catch (error) {
    console.error('Error generating code:', error);
  }
}

// Run the example
generateCode();