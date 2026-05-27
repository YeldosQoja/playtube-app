import pino, { type Logger } from "pino";
import dotenv from "dotenv";

export class LoggerService {
  private readonly pinoLogger: Logger;

  constructor() {
    dotenv.config();

    const level = process.env["NODE_ENV"] !== "production" ? "trace" : "info";
    const fileTransport = pino.transport({
      targets: [
        {
          target: "pino/file",
          level,
          options: { destination: `${import.meta.dirname}/app.log` },
        },
        {
          target: "pino-pretty",
          level,
        },
      ],
    });

    this.pinoLogger = pino(
      {
        timestamp: pino.stdTimeFunctions.isoTime,
        level,
        redact: {
          paths: [
            "name",
            "username",
            "address",
            "phone",
            "email",
            "password",
            "salt",
            "user.firstName",
            "user.lastName",
            "user.email",
            "user.username",
            "user.password",
            "user.salt",
            "*.user.firstName",
            "*.user.lastName",
            "*.user.email",
            "*.user.username",
            "*.user.password",
            "*.user.salt",
          ],
          remove: true,
        },
      },
      fileTransport,
    );
  }

  getHttpLogger(): Logger {
    return this.pinoLogger;
  }

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

export const loggerService = new LoggerService();
