import pino from "pino";

const fileTransport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: `${import.meta.dirname}/app.log` },
    },
    {
      target: "pino-pretty",
    },
  ],
});

const logger = pino(
  {
    level: process.env["NODE_ENV"] === "production" ? "info" : "trace",
    timestamp: pino.stdTimeFunctions.isoTime,
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
