#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { GroqClient } from './lib/groq-client.js';
import { logger } from './lib/logger.js';
import { displayHelp } from './lib/help.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('chat', 'Start an interactive chat session with the AI')
  .command('complete', 'Generate a completion for a given prompt', {
    prompt: {
      description: 'The prompt to complete',
      alias: 'p',
      type: 'string',
      demandOption: true
    },
    output: {
      description: 'Output file path (optional)',
      alias: 'o',
      type: 'string'
    }
  })
  .option('model', {
    description: 'The model to use',
    alias: 'm',
    type: 'string',
    default: 'qwen-2.5-coder-32b'
  })
  .option('temperature', {
    description: 'Temperature for response generation',
    alias: 't',
    type: 'number',
    default: 0.6
  })
  .option('max-tokens', {
    description: 'Maximum tokens to generate',
    alias: 'mt',
    type: 'number',
    default: 4096
  })
  .option('top-p', {
    description: 'Top-p sampling value',
    alias: 'tp',
    type: 'number',
    default: 0.95
  })
  .option('verbose', {
    description: 'Enable verbose logging',
    alias: 'v',
    type: 'boolean',
    default: false
  })
  .option('help', {
    description: 'Show help',
    alias: 'h',
    type: 'boolean'
  })
  .help(false)
  .argv;

// Show help if requested or no command provided
if (argv.help || (!argv._.length && process.stdin.isTTY)) {
  displayHelp();
  process.exit(0);
}

// Set log level based on verbose flag
if (argv.verbose) {
  logger.level = 'debug';
}

// Initialize the Groq client
const groqClient = new GroqClient({
  apiKey: process.env.GROQ_API_KEY,
  maxTokensPerMinute: parseInt(process.env.MAX_TOKENS_PER_MINUTE || '90000', 10)
});

// Main function
async function main() {
  try {
    const command = argv._[0];

    switch (command) {
      case 'chat':
        await groqClient.startInteractiveChat({
          model: argv.model,
          temperature: argv.temperature,
          maxCompletionTokens: argv.maxTokens,
          topP: argv.topP
        });
        break;
      
      case 'complete':
        if (!argv.prompt) {
          logger.error('Error: Prompt is required for completion');
          process.exit(1);
        }
        
        await groqClient.generateCompletion({
          prompt: argv.prompt,
          model: argv.model,
          temperature: argv.temperature,
          maxCompletionTokens: argv.maxTokens,
          topP: argv.topP,
          outputFile: argv.output
        });
        break;
      
      default:
        if (command) {
          logger.error(`Unknown command: ${command}`);
        } else {
          // No command provided, check if input is being piped
          if (!process.stdin.isTTY) {
            let input = '';
            process.stdin.on('data', (chunk) => {
              input += chunk;
            });
            
            process.stdin.on('end', async () => {
              await groqClient.generateCompletion({
                prompt: input,
                model: argv.model,
                temperature: argv.temperature,
                maxCompletionTokens: argv.maxTokens,
                topP: argv.topP,
                outputFile: argv.output
              });
            });
          } else {
            displayHelp();
            process.exit(1);
          }
        }
    }
  } catch (error) {
    logger.error('Error in main execution:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});