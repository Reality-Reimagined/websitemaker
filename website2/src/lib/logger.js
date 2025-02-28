import winston from 'winston';

// Configure logger
const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'groq-bolt' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error',
      dirname: 'logs' 
    }),
    
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'combined.log',
      dirname: 'logs'
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream object with a 'write' function that will be used by morgan
export const logStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};