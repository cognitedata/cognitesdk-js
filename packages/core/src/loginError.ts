// Copyright 2020 Cognite AS

import { LoggerEventTypes } from './logger';

export class CogniteLoginError extends Error {
  constructor(
    message: string = 'Not able to login',
    public data: { [key: string]: any } = {}
  ) {
    super(message);

    this.data = { type: LoggerEventTypes.Error, ...this.data };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}
