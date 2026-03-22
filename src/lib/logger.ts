import pino from "pino";
import dotenv from "dotenv";

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

const logger = pino(
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

export default logger;
