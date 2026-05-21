import type { Logger } from "pino";
import logger from "./logger.js";

export class LoggerService {
  constructor(private readonly pinoLogger: Logger) {}

  trace(...args: Parameters<Logger["trace"]>): void {
    this.pinoLogger.trace(...args);
  }

  debug(...args: Parameters<Logger["debug"]>): void {
    this.pinoLogger.debug(...args);
  }

  info(...args: Parameters<Logger["info"]>): void {
    this.pinoLogger.info(...args);
  }

  warn(...args: Parameters<Logger["warn"]>): void {
    this.pinoLogger.warn(...args);
  }

  error(...args: Parameters<Logger["error"]>): void {
    this.pinoLogger.error(...args);
  }

  fatal(...args: Parameters<Logger["fatal"]>): void {
    this.pinoLogger.fatal(...args);
  }
}

export const loggerService = new LoggerService(logger);
