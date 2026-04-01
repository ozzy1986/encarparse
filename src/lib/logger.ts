import * as fs from "node:fs";
import * as path from "node:path";

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  close(): void;
}

function timestamp() {
  return new Date().toISOString();
}

export function createScrapeLogger(label: string): Logger {
  const logsDir = path.resolve(process.cwd(), "logs");
  fs.mkdirSync(logsDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const logFile = path.join(logsDir, `${label}-${date}.log`);
  const stream = fs.createWriteStream(logFile, { flags: "a" });

  function write(level: string, message: string) {
    const line = `${timestamp()} [${level}] ${message}`;
    console[level === "ERROR" ? "error" : level === "WARN" ? "warn" : "info"](line);
    stream.write(line + "\n");
  }

  return {
    info: (message: string) => write("INFO", message),
    warn: (message: string) => write("WARN", message),
    error: (message: string) => write("ERROR", message),
    close: () => stream.end(),
  };
}
