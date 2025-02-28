/**
 * Example: Batch Processing with Groq Bolt
 * 
 * This example demonstrates how to process multiple prompts in batch,
 * respecting rate limits and handling errors.
 */

import { GroqClient } from '../src/lib/groq-client.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

async function processBatch() {
  // Initialize the Groq client
  const groqClient = new GroqClient({
    apiKey: process.env.GROQ_API_KEY,
    maxTokensPerMinute: parseInt(process.env.MAX_TOKENS_PER_MINUTE || '90000', 10)
  });

  // Sample batch of prompts
  const prompts = [
    {
      id: 'function1',
      prompt: 'Write a JavaScript function to check if a string is a palindrome',
      outputFile: 'examples/output/palindrome.js'
    },
    {
      id: 'function2',
      prompt: 'Write a JavaScript function to find the most frequent item in an array',
      outputFile: 'examples/output/most-frequent.js'
    },
    {
      id: 'function3',
      prompt: 'Write a JavaScript function to convert an object to a URL query string',
      outputFile: 'examples/output/object-to-query.js'
    },
    {
      id: 'function4',
      prompt: 'Write a JavaScript function to deep clone an object',
      outputFile: 'examples/output/deep-clone.js'
    }
  ];

  console.log(`Starting batch processing of ${prompts.length} prompts...\n`);

  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(path.dirname(prompts[0].outputFile), { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
  }

  // Process each prompt
  const results = [];
  for (const [index, item] of prompts.entries()) {
    console.log(`Processing item ${index + 1}/${prompts.length}: ${item.id}`);
    
    try {
      // Generate completion
      const result = await groqClient.generateCompletion({
        prompt: item.prompt,
        model: 'qwen-2.5-coder-32b',
        temperature: 0.6,
        maxCompletionTokens: 2048,
        topP: 0.95,
        outputFile: item.outputFile
      });
      
      results.push({
        id: item.id,
        status: 'success',
        outputFile: item.outputFile
      });
      
      console.log(`✅ Completed: ${item.id}\n`);
    } catch (error) {
      console.error(`❌ Error processing ${item.id}:`, error.message);
      
      results.push({
        id: item.id,
        status: 'error',
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\n=== Batch Processing Summary ===');
  const successful = results.filter(r => r.status === 'success').length;
  console.log(`Total: ${prompts.length}, Successful: ${successful}, Failed: ${prompts.length - successful}`);
  
  // List all results
  console.log('\nResults:');
  for (const result of results) {
    if (result.status === 'success') {
      console.log(`- ${result.id}: Success (${result.outputFile})`);
    } else {
      console.log(`- ${result.id}: Failed (${result.error})`);
    }
  }
}

// Run the example
processBatch();