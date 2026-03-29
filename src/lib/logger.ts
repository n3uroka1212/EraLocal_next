/**
 * Structured JSON logger for production observability.
 *
 * Outputs one JSON object per line to stdout/stderr, compatible with
 * log aggregators (Datadog, Loki, CloudWatch, etc.).
 */

type LogMeta = Record<string, unknown>;

function formatEntry(level: string, msg: string, meta?: LogMeta): string {
  return JSON.stringify({
    level,
    msg,
    ...meta,
    ts: new Date().toISOString(),
  });
}

export const logger = {
  info(msg: string, meta?: LogMeta): void {
    console.log(formatEntry("info", msg, meta));
  },

  warn(msg: string, meta?: LogMeta): void {
    console.warn(formatEntry("warn", msg, meta));
  },

  error(msg: string, meta?: LogMeta): void {
    console.error(formatEntry("error", msg, meta));
  },
};
