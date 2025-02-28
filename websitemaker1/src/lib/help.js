export function displayHelp() {
  console.log(`
Groq Bolt Application - A CLI tool for interacting with Groq's Qwen 2.5 Coder model

Usage:
  node src/index.js <command> [options]

Commands:
  chat                     Start an interactive chat session with the AI
  complete --prompt <text> Generate a completion for a given prompt

Options:
  --model, -m              The model to use (default: "qwen-2.5-coder-32b")
  --temperature, -t        Temperature for response generation (default: 0.6)
  --max-tokens, -mt        Maximum tokens to generate (default: 4096)
  --top-p, -tp             Top-p sampling value (default: 0.95)
  --verbose, -v            Enable verbose logging
  --help, -h               Show this help message

Examples:
  # Start an interactive chat session
  node src/index.js chat

  # Generate a completion for a prompt
  node src/index.js complete --prompt "Write a function to calculate Fibonacci numbers"

  # Generate a completion and save to a file
  node src/index.js complete --prompt "Write a React component" --output component.jsx

  # Pipe content to the tool
  cat prompt.txt | node src/index.js

  # Use with different model parameters
  node src/index.js chat --temperature 0.8 --top-p 0.99
`);
}