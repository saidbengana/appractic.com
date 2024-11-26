interface LoggerOptions {
  component?: string;
}

interface LogContext {
  [key: string]: any;
}

export function createLogger(options: LoggerOptions = {}) {
  const prefix = options.component ? `[${options.component}]` : '';

  return {
    log(message: string, ...args: any[]) {
      console.log(`${prefix} ${message}`, ...args);
    },
    error(message: string, error?: Error, context?: LogContext) {
      console.error(`${prefix} ${message}`, error, context);
    },
    warn(message: string, ...args: any[]) {
      console.warn(`${prefix} ${message}`, ...args);
    },
    info(message: string, ...args: any[]) {
      console.info(`${prefix} ${message}`, ...args);
    }
  };
}
