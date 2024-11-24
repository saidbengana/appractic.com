import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

type LogContext = {
  userId?: string;
  requestId?: string;
  [key: string]: any;
};

export class Logger {
  private context?: LogContext;

  constructor(context?: LogContext) {
    this.context = context;
  }

  private formatMessage(message: string, context?: LogContext) {
    return {
      msg: message,
      ...this.context,
      ...context,
    };
  }

  debug(message: string, context?: LogContext) {
    logger.debug(this.formatMessage(message, context));
  }

  info(message: string, context?: LogContext) {
    logger.info(this.formatMessage(message, context));
  }

  warn(message: string, context?: LogContext) {
    logger.warn(this.formatMessage(message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    logger.error(
      {
        ...this.formatMessage(message, context),
        error: error ? { message: error.message, stack: error.stack } : undefined,
      }
    );
  }
}

export const createLogger = (context?: LogContext) => new Logger(context);
