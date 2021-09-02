import winston from "winston";

const { combine, timestamp, json } = winston.format;

const logConfiguration = {
  level: process.env["LOG_LEVEL"] || "info",
  transports: [new winston.transports.Console()],
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json()
  ),
};

export default winston.createLogger(logConfiguration);
