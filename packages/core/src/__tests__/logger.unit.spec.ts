import { Logger } from '../logger';

describe('Logger', () => {
  const spyConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
    /* ignore console.log */
  });
  const mockLogger = jest.fn();
  const message = 'message';
  const data = { test: 'test' };

  beforeEach(() => {
    spyConsoleLog.mockClear();
    mockLogger.mockReset();
  });

  afterAll(() => {
    spyConsoleLog.mockRestore();
  });

  test('should call console.log by default', () => {
    const logger = new Logger();
    const loggerId = 'some-id';

    logger.attach(loggerId).enable(loggerId);
    logger.log(loggerId, message);

    expect(spyConsoleLog).toHaveBeenCalledWith({ message });
  });

  test('should be disabled by default', () => {
    const logger = new Logger();
    const loggerId = 'some-id';

    logger.attach(loggerId);
    logger.log(loggerId, 'message');

    expect(spyConsoleLog).toHaveBeenCalledTimes(0);
  });

  test('should attach logger if provided', () => {
    const logger = new Logger();
    const loggerId = 'some-id';

    logger.attach(loggerId, mockLogger).enable(loggerId);
    logger.log(loggerId, message);

    expect(mockLogger).toHaveBeenCalledWith({ message });
  });

  test('should call logger with data if provided', () => {
    const logger = new Logger();
    const loggerId = 'some-id';

    logger.attach(loggerId, mockLogger).enable(loggerId);
    logger.log(loggerId, { message, data });

    expect(mockLogger).toHaveBeenCalledWith({ message, data });
  });
});
