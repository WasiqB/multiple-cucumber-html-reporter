import { createLogger, normalizeLogLevel } from '../../logger.js';

describe('logger.js', () => {
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should normalize logging options and preserve disableLog as a silent alias', () => {
    expect(normalizeLogLevel(undefined, undefined)).toBe('info');
    expect(normalizeLogLevel('debug', undefined)).toBe('debug');
    expect(normalizeLogLevel(false, undefined)).toBe('silent');
    expect(normalizeLogLevel({ enabled: false }, undefined)).toBe('silent');
    expect(normalizeLogLevel({ level: 'trace' }, undefined)).toBe('trace');
    expect(normalizeLogLevel('debug', true)).toBe('silent');
  });

  it('should format log messages with timestamp, level, namespace, and structured context', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-07-30T10:15:30.000Z'));
    spyOn(console, 'log');

    const logger = createLogger('info');
    logger.info('Report generated successfully.', {
      report: '/tmp/report/index.html',
      featureCount: 3,
      cached: false,
      skipped: undefined,
    });

    expect(console.log).toHaveBeenCalledOnceWith(
      '2026-07-30T10:15:30.000Z INFO  [multiple-cucumber-html-reporter] Report generated successfully. report="/tmp/report/index.html" featureCount=3 cached=false',
    );
  });

  it('should route levels to the matching console methods', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-07-30T10:15:30.000Z'));
    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'log');
    spyOn(console, 'debug');
    spyOn(console, 'trace');

    const logger = createLogger('trace');
    logger.error('Error message.');
    logger.warn('Warning message.');
    logger.info('Info message.');
    logger.debug('Debug message.');
    logger.trace('Trace message.');

    expect(console.error).toHaveBeenCalledOnceWith(
      '2026-07-30T10:15:30.000Z ERROR [multiple-cucumber-html-reporter] Error message.',
    );
    expect(console.warn).toHaveBeenCalledOnceWith(
      '2026-07-30T10:15:30.000Z WARN  [multiple-cucumber-html-reporter] Warning message.',
    );
    expect(console.log).toHaveBeenCalledOnceWith(
      '2026-07-30T10:15:30.000Z INFO  [multiple-cucumber-html-reporter] Info message.',
    );
    expect(console.debug).toHaveBeenCalledOnceWith(
      '2026-07-30T10:15:30.000Z DEBUG [multiple-cucumber-html-reporter] Debug message.',
    );
    expect(console.trace).toHaveBeenCalledOnceWith(
      '2026-07-30T10:15:30.000Z TRACE [multiple-cucumber-html-reporter] Trace message.',
    );
  });

  it('should filter logs below the configured level', () => {
    spyOn(console, 'warn');
    spyOn(console, 'log');
    spyOn(console, 'debug');

    const logger = createLogger('warn');
    logger.warn('Visible warning.');
    logger.info('Hidden info.');
    logger.debug('Hidden debug.');

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.log).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should hide every log when silent is configured', () => {
    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'log');
    spyOn(console, 'debug');
    spyOn(console, 'trace');

    const logger = createLogger('silent');
    logger.error('Hidden error.');
    logger.warn('Hidden warning.');
    logger.info('Hidden info.');
    logger.debug('Hidden debug.');
    logger.trace('Hidden trace.');

    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.trace).not.toHaveBeenCalled();
  });

  it('should include error details in structured context', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-07-30T10:15:30.000Z'));
    spyOn(console, 'debug');

    const error = new Error('Cannot parse JSON');
    createLogger('debug').debug('Cucumber JSON parse error details.', { file: 'broken.json', error });

    const message = String((console.debug as jasmine.Spy).calls.mostRecent().args[0]);
    expect(message).toContain('2026-07-30T10:15:30.000Z DEBUG [multiple-cucumber-html-reporter]');
    expect(message).toContain('file="broken.json"');
    expect(message).toContain('error={"name":"Error","message":"Cannot parse JSON"');
  });
});
