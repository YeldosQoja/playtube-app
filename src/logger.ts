import pino from "pino";

const fileTransport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: `${__dirname}/app.log` },
    },
    {
      target: "pino-pretty",
    },
  ],
});

const logger = pino(
  {
    level: process.env["NODE_ENV"] === "production" ? "info" : "trace",
    formatters: {
      bindings: (bindings) => {
        return {
          processId: bindings["pid"],
          host: bindings["hostname"],
          node: process.version,
        };
      },
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "name",
        "username",
        "address",
        "phone",
        "email",
        "*.user.firstName",
        "*.user.lastName",
        "*.user.email",
        "*.user.username",
        "*.user.password",
        "*.user.salt",
      ],
    },
  },
  fileTransport,
);

export default logger;
