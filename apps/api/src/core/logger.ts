import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file"; 
import { config } from "./config.js";
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logDir, "%DATE%-error.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: config.nodeEnv === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
        )
      )
    }),
    dailyRotateFileTransport,
  ],
});

export default logger;
