import fs from 'fs';
import readline from 'readline';
import Groq from 'groq-sdk';
import pLimit from 'p-limit';
import { logger } from './logger.js';
import { TokenBucket } from './token-bucket.js';

export class GroqClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey;
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is required. Please set it in your .env file.');
    }

    this.groq = new Groq({ apiKey: this.apiKey });
    this.maxTokensPerMinute = options.maxTokensPerMinute || 90000;
    
    // Initialize token bucket for rate limiting
    this.tokenBucket = new TokenBucket({
      tokensPerMinute: this.maxTokensPerMinute,
      refillIntervalMs: 60000 / 10, // Refill 1/10th of the tokens every 1/10th of a minute
    });

    // Concurrency limiter
    this.limiter = pLimit(5); // Limit to 5 concurrent requests
    
    // Chat history for interactive sessions
    this.chatHistory = [];
  }

  /**
   * Estimate token count for a given text
   * This is a very rough estimate - 1 token is approximately 4 characters for English text
   * @param {string} text - The text to estimate tokens for
   * @returns {number} - Estimated token count
   */
  estimateTokenCount(text) {
    // Very rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate a completion for a given prompt
   * @param {Object} options - Options for completion
   * @param {string} options.prompt - The prompt to complete
   * @param {string} options.model - The model to use
   * @param {number} options.temperature - Temperature for response generation
   * @param {number} options.maxCompletionTokens - Maximum tokens to generate
   * @param {number} options.topP - Top-p sampling value
   * @param {string} options.outputFile - Output file path (optional)
   * @returns {Promise<string>} - The generated completion
   */
  async generateCompletion(options) {
    const {
      prompt,
      model = 'qwen-2.5-coder-32b',
      temperature = 0.6,
      maxCompletionTokens = 4096,
      topP = 0.95,
      outputFile
    } = options;

    // Estimate input tokens
    const estimatedInputTokens = this.estimateTokenCount(prompt);
    logger.debug(`Estimated input tokens: ${estimatedInputTokens}`);

    // Check if we have enough tokens in the bucket
    const estimatedTotalTokens = estimatedInputTokens + maxCompletionTokens;
    await this.tokenBucket.consume(estimatedTotalTokens);

    try {
      logger.info(`Generating completion with model: ${model}`);
      logger.debug(`Parameters: temperature=${temperature}, maxTokens=${maxCompletionTokens}, topP=${topP}`);

      const messages = [{ role: 'user', content: prompt }];
      
      const chatCompletion = await this.limiter(() => 
        this.groq.chat.completions.create({
          messages,
          model,
          temperature,
          max_completion_tokens: maxCompletionTokens,
          top_p: topP,
          stream: true,
          stop: null
        })
      );

      let fullResponse = '';
      let outputStream = process.stdout;
      let fileStream = null;

      // Set up file output if specified
      if (outputFile) {
        fileStream = fs.createWriteStream(outputFile);
        logger.info(`Writing output to file: ${outputFile}`);
      }

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        
        // Write to stdout
        outputStream.write(content);
        
        // Write to file if specified
        if (fileStream) {
          fileStream.write(content);
        }
      }

      // Close file stream if open
      if (fileStream) {
        fileStream.end();
      }

      // Add a newline at the end of the output
      outputStream.write('\n');

      // Update token usage
      const estimatedOutputTokens = this.estimateTokenCount(fullResponse);
      logger.debug(`Estimated output tokens: ${estimatedOutputTokens}`);
      logger.info(`Estimated total tokens used: ${estimatedInputTokens + estimatedOutputTokens}`);

      return fullResponse;
    } catch (error) {
      logger.error('Error generating completion:', error);
      throw error;
    }
  }

  /**
   * Start an interactive chat session
   * @param {Object} options - Options for the chat session
   * @param {string} options.model - The model to use
   * @param {number} options.temperature - Temperature for response generation
   * @param {number} options.maxCompletionTokens - Maximum tokens to generate
   * @param {number} options.topP - Top-p sampling value
   */
  async startInteractiveChat(options) {
    const {
      model = 'qwen-2.5-coder-32b',
      temperature = 0.6,
      maxCompletionTokens = 4096,
      topP = 0.95
    } = options;

    logger.info(`Starting interactive chat with model: ${model}`);
    logger.info('Type your messages and press Enter. Type "exit" or "quit" to end the session.');
    logger.info('Type "clear" to clear the chat history.');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });

    // Initialize chat history with system message
    this.chatHistory = [
      {
        role: 'system',
        content: 'You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices. Your roles is to make truely impressive websites based on the user requests. Make sure you try to impress every single time!'
      }
    ];

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        rl.close();
        return;
      }

      if (input.toLowerCase() === 'clear') {
        this.chatHistory = [this.chatHistory[0]]; // Keep only the system message
        console.log('Chat history cleared.');
        rl.prompt();
        return;
      }

      if (!input) {
        rl.prompt();
        return;
      }

      // Add user message to history
      this.chatHistory.push({ role: 'user', content: input });

      // Estimate input tokens for all messages in history
      const allMessages = this.chatHistory.map(msg => msg.content).join(' ');
      const estimatedInputTokens = this.estimateTokenCount(allMessages);
      
      try {
        // Check if we have enough tokens in the bucket
        const estimatedTotalTokens = estimatedInputTokens + maxCompletionTokens;
        await this.tokenBucket.consume(estimatedTotalTokens);

        console.log('\nAI is thinking...');
        
        const chatCompletion = await this.limiter(() => 
          this.groq.chat.completions.create({
            messages: this.chatHistory,
            model,
            temperature,
            max_completion_tokens: maxCompletionTokens,
            top_p: topP,
            stream: true,
            stop: null
          })
        );

        let fullResponse = '';
        console.log(''); // Add a newline before the response

        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          process.stdout.write(content);
        }

        // Add assistant response to history
        this.chatHistory.push({ role: 'assistant', content: fullResponse });

        // Update token usage
        const estimatedOutputTokens = this.estimateTokenCount(fullResponse);
        logger.debug(`Estimated input tokens: ${estimatedInputTokens}`);
        logger.debug(`Estimated output tokens: ${estimatedOutputTokens}`);
        logger.debug(`Estimated total tokens used: ${estimatedInputTokens + estimatedOutputTokens}`);

        // Check if we need to trim history to avoid token limits
        this.trimChatHistory(8000); // Keep under 8000 tokens to be safe

        console.log('\n'); // Add a newline after the response
      } catch (error) {
        console.error('\nError:', error.message);
        logger.error('Error in chat:', error);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\nEnding chat session. Goodbye!');
      process.exit(0);
    });
  }

  /**
   * Trim chat history to stay under token limit
   * @param {number} maxTokens - Maximum tokens to keep in history
   */
  trimChatHistory(maxTokens) {
    // Always keep the system message
    const systemMessage = this.chatHistory[0];
    let currentHistory = this.chatHistory.slice(1);
    
    // Estimate current token count
    let totalTokens = this.estimateTokenCount(
      this.chatHistory.map(msg => msg.content).join(' ')
    );
    
    logger.debug(`Current chat history token count: ~${totalTokens}`);
    
    // If we're under the limit, no need to trim
    if (totalTokens <= maxTokens) {
      return;
    }
    
    logger.info(`Trimming chat history to stay under ${maxTokens} tokens`);
    
    // Remove oldest messages first (but keep the most recent 4 exchanges)
    while (totalTokens > maxTokens && currentHistory.length > 4) {
      const removed = currentHistory.shift();
      const removedTokens = this.estimateTokenCount(removed.content);
      totalTokens -= removedTokens;
      logger.debug(`Removed message with ~${removedTokens} tokens`);
    }
    
    // Reconstruct history with system message
    this.chatHistory = [systemMessage, ...currentHistory];
    
    logger.debug(`New chat history token count: ~${totalTokens}`);
  }
}