import type { LoggingOptions } from './types.js';

export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug', 'trace'] as const;

type ConsoleMethod = 'error' | 'warn' | 'log' | 'debug' | 'trace';
type LogContext = Record<string, unknown>;

const LOG_LEVEL_PRIORITY: Record<(typeof LOG_LEVELS)[number], number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const LOG_LEVEL_METHOD: Record<Exclude<(typeof LOG_LEVELS)[number], 'silent'>, ConsoleMethod> = {
  error: 'error',
  warn: 'warn',
  info: 'log',
  debug: 'debug',
  trace: 'trace',
};

export type Logger = {
  level: (typeof LOG_LEVELS)[number];
  error: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  trace: (message: string, context?: LogContext) => void;
};

export function normalizeLogLevel(
  logging: LoggingOptions | undefined,
  disableLog: boolean | undefined,
): (typeof LOG_LEVELS)[number] {
  if (disableLog) {
    return 'silent';
  }

  if (typeof logging === 'string') {
    return isLogLevel(logging) ? logging : 'info';
  }

  if (logging === false || logging?.enabled === false) {
    return 'silent';
  }

  if (logging?.level && isLogLevel(logging.level)) {
    return logging.level;
  }

  return 'info';
}

export function createLogger(logging: LoggingOptions | undefined, disableLog?: boolean): Logger {
  const level = normalizeLogLevel(logging, disableLog);

  function write(
    messageLevel: Exclude<(typeof LOG_LEVELS)[number], 'silent'>,
    message: string,
    context?: LogContext,
  ): void {
    if (level === 'silent' || LOG_LEVEL_PRIORITY[messageLevel] > LOG_LEVEL_PRIORITY[level]) {
      return;
    }

    console[LOG_LEVEL_METHOD[messageLevel]](formatLogMessage(messageLevel, message, context));
  }

  return {
    level,
    error: (message: string, context?: LogContext) => write('error', message, context),
    warn: (message: string, context?: LogContext) => write('warn', message, context),
    info: (message: string, context?: LogContext) => write('info', message, context),
    debug: (message: string, context?: LogContext) => write('debug', message, context),
    trace: (message: string, context?: LogContext) => write('trace', message, context),
  };
}

function formatLogMessage(
  level: Exclude<(typeof LOG_LEVELS)[number], 'silent'>,
  message: string,
  context?: LogContext,
): string {
  const timestamp = new Date().toISOString();
  const prefix = `${timestamp} ${level.toUpperCase().padEnd(5)} [multiple-cucumber-html-reporter]`;
  const contextText = formatContext(context);

  return contextText ? `${prefix} ${message} ${contextText}` : `${prefix} ${message}`;
}

function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }

  return Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${formatContextValue(value)}`)
    .join(' ');
}

function formatContextValue(value: unknown): string {
  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    });
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }

  return JSON.stringify(value);
}

function isLogLevel(value: string): value is (typeof LOG_LEVELS)[number] {
  return LOG_LEVELS.includes(value as (typeof LOG_LEVELS)[number]);
}
