// Copyright 2020 Cognite AS
export type LoggerFunc = (event: LoggerEvent) => void;

export interface LoggerEventData {
  type?: LoggerEventTypes;
  [key: string]: any;
}

export enum LoggerEventTypes {
  Error = 'error',
}

export interface LoggerEvent {
  message: string;
  data?: LoggerEventData;
}

interface LoggersMap {
  [key: string]: LoggerMapInstance;
}

interface LoggerMapInstance {
  active: boolean;
  logger: LoggerFunc;
}

const defaultLogger = (event: LoggerEvent) => console.log(event);

export class Logger {
  constructor(private loggers: LoggersMap = {}) {}

  public log(id: string, event: string | LoggerEvent) {
    if (!this.loggers[id]) {
      return;
    }

    const loggedEvent = typeof event === 'string' ? { message: event } : event;
    const { active, logger } = this.loggers[id];

    if (active) {
      logger(loggedEvent);
    }
  }

  public enable(id: string) {
    if (this.loggers[id]) {
      this.loggers[id].active = true;
    }
  }

  public disable(id: string) {
    if (this.loggers[id]) {
      this.loggers[id].active = false;
    }
  }

  public attach(id: string, logger: LoggerFunc = defaultLogger): Logger {
    this.loggers[id] = {
      active: false,
      logger,
    };

    return this;
  }

  public detach(id: string): Logger {
    if (this.loggers[id]) {
      this.loggers[id] = {
        active: false,
        logger: defaultLogger,
      };
    }

    return this;
  }
}

export const logger = new Logger();
