import { logger } from './logger.js';

/**
 * Token Bucket implementation for rate limiting
 * This helps manage token usage to stay within Groq's rate limits
 */
export class TokenBucket {
  constructor(options = {}) {
    this.tokensPerMinute = options.tokensPerMinute || 90000;
    this.refillIntervalMs = options.refillIntervalMs || 6000; // Default: refill every 6 seconds
    
    // Calculate tokens per refill interval
    this.tokensPerInterval = Math.floor(this.tokensPerMinute * (this.refillIntervalMs / 60000));
    
    // Initialize the bucket with full capacity
    this.tokens = this.tokensPerMinute;
    this.lastRefillTimestamp = Date.now();
    
    // Start the refill interval
    this.startRefillInterval();
    
    logger.info(`Token bucket initialized with ${this.tokensPerMinute} tokens per minute`);
    logger.debug(`Refill interval: ${this.refillIntervalMs}ms, Tokens per interval: ${this.tokensPerInterval}`);
  }
  
  /**
   * Start the token refill interval
   */
  startRefillInterval() {
    this.refillInterval = setInterval(() => this.refill(), this.refillIntervalMs);
    this.refillInterval.unref(); // Don't keep the process alive just for this timer
  }
  
  /**
   * Refill the token bucket
   */
  refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefillTimestamp;
    
    // Calculate how many tokens to add based on time passed
    const tokensToAdd = Math.floor(
      (timePassed / this.refillIntervalMs) * this.tokensPerInterval
    );
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.tokensPerMinute);
      this.lastRefillTimestamp = now;
      logger.debug(`Refilled ${tokensToAdd} tokens. Current tokens: ${this.tokens}`);
    }
  }
  
  /**
   * Consume tokens from the bucket
   * @param {number} tokenCount - Number of tokens to consume
   * @returns {Promise<void>} - Resolves when tokens are available and consumed
   */
  async consume(tokenCount) {
    // Force a refill before checking
    this.refill();
    
    // If we have enough tokens, consume them immediately
    if (this.tokens >= tokenCount) {
      this.tokens -= tokenCount;
      logger.debug(`Consumed ${tokenCount} tokens. Remaining: ${this.tokens}`);
      return;
    }
    
    // Otherwise, wait until we have enough tokens
    logger.info(`Rate limit: waiting for ${tokenCount} tokens. Currently have ${this.tokens}`);
    
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        this.refill();
        
        if (this.tokens >= tokenCount) {
          clearInterval(checkInterval);
          this.tokens -= tokenCount;
          logger.debug(`Consumed ${tokenCount} tokens after waiting. Remaining: ${this.tokens}`);
          resolve();
        }
      }, 1000); // Check every second
    });
  }
  
  /**
   * Get the current number of available tokens
   * @returns {number} - Available tokens
   */
  getAvailableTokens() {
    this.refill();
    return this.tokens;
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    if (this.refillInterval) {
      clearInterval(this.refillInterval);
    }
  }
}