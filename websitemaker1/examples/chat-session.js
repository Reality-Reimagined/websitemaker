/**
 * Example: Interactive Chat Session with Groq Bolt
 * 
 * This example demonstrates how to programmatically use the chat
 * functionality of the Groq Bolt application.
 */

import { GroqClient } from '../src/lib/groq-client.js';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

async function startProgrammaticChat() {
  // Initialize the Groq client
  const groqClient = new GroqClient({
    apiKey: process.env.GROQ_API_KEY,
    maxTokensPerMinute: parseInt(process.env.MAX_TOKENS_PER_MINUTE || '90000', 10)
  });

  // Create a readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You: '
  });

  console.log('=== Programmatic Chat Example ===');
  console.log('This example shows how to use the Groq client in your own application.');
  console.log('Type your messages and press Enter. Type "exit" to end the session.\n');

  // Initialize chat history
  const chatHistory = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant specialized in JavaScript programming.'
    }
  ];

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    // Add user message to history
    chatHistory.push({ role: 'user', content: input });

    try {
      console.log('\nAI is thinking...');
      
      const chatCompletion = await groqClient.groq.chat.completions.create({
        messages: chatHistory,
        model: 'qwen-2.5-coder-32b',
        temperature: 0.6,
        max_completion_tokens: 2048,
        top_p: 0.95,
        stream: true
      });

      let fullResponse = '';
      console.log('\nAI: ');

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        process.stdout.write(content);
      }

      // Add assistant response to history
      chatHistory.push({ role: 'assistant', content: fullResponse });
      console.log('\n');
    } catch (error) {
      console.error('\nError:', error.message);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nEnding chat session. Goodbye!');
    process.exit(0);
  });
}

// Run the example
startProgrammaticChat();