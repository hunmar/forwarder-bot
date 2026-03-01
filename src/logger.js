const levels = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const configuredLevel = (process.env.LOG_LEVEL ?? "info").toLowerCase();
const activeLevel = levels[configuredLevel] ?? levels.info;

const sanitizeMeta = (meta) => {
  if (!meta) {
    return undefined;
  }

  const clone = { ...meta };
  if (clone.botToken) {
    clone.botToken = "[REDACTED]";
  }

  return clone;
};

const write = (level, message, meta) => {
  if (levels[level] < activeLevel) {
    return;
  }

  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...sanitizeMeta(meta)
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  debug: (message, meta) => write("debug", message, meta),
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta)
};
