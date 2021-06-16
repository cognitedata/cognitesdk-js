// Copyright 2020 Cognite AS

import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import isBuffer from 'is-buffer';
import { API_VERSION, BASE_URL } from './constants';
import { CogniteError } from './error';
import { CogniteMultiError } from './multiError';

/** @hidden */
export function getBaseUrl(baseUrl?: string) {
  return baseUrl || BASE_URL;
}

/** @hidden */
export const apiUrl = () => `/api/${API_VERSION}`;

/** @hidden */
export function projectUrl(project: string) {
  return `${apiUrl()}/projects/${encodeURIComponent(project)}`;
}

/** @hidden */
export function bearerString(token: string) {
  return `Bearer ${token}`;
}

/** @hidden */
export function isBrowser() {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

export function clearParametersFromUrl(...params: string[]): void {
  let url = window.location.href;
  params.forEach(param => {
    url = removeQueryParameterFromUrl(url, param);
  });
  window.history.replaceState(null, '', url);
}

/** @hidden */
export function removeQueryParameterFromUrl(
  url: string,
  parameter: string
): string {
  return url
    .replace(new RegExp('[?#&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?#&])' + parameter + '=[^&]*&'), '$1');
}

/** @hidden */
export function convertToTimestampToDateTime(timestamp: number): Date {
  return new Date(timestamp);
}

/** @hidden */
export function isJson(data: any) {
  return (
    (isArray(data) || isObject(data)) &&
    !isBuffer(data) &&
    !(data instanceof ArrayBuffer) &&
    !(data instanceof Date)
  );
}

/** @hidden */
export function sleepPromise(durationInMs: number) {
  return new Promise(resolve => {
    setTimeout(resolve, durationInMs);
  });
}

/** @hidden */
export function promiseCache<ReturnValue>(
  promiseFn: () => Promise<ReturnValue>
) {
  let unresolvedPromise: Promise<ReturnValue> | null = null;
  return () => {
    if (unresolvedPromise) {
      return unresolvedPromise;
    }
    return (unresolvedPromise = promiseFn().then(res => {
      unresolvedPromise = null;
      return res;
    }));
  };
}

/**
 * Resolves all Promises at once, even if some of them fail
 */
/** @hidden */
export async function promiseAllAtOnce<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  const failed: RequestType[] = [];
  const succeded: RequestType[] = [];
  const responses: ResponseType[] = [];
  const errors: (Error | CogniteError)[] = [];

  const promises = inputs.map(input => promiser(input));

  const wrappedPromises = promises.map((promise, index) =>
    promise
      .then(result => {
        succeded.push(inputs[index]);
        responses.push(result);
      })
      .catch(error => {
        failed.push(inputs[index]);
        errors.push(error);
      })
  );
  await Promise.all(wrappedPromises);
  if (failed.length) {
    throw {
      succeded,
      responses,
      failed,
      errors,
    };
  }

  return responses;
}

/** @hidden */
export async function promiseAllWithData<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>,
  runSequentially: boolean
) {
  try {
    if (runSequentially) {
      return await promiseEachInSequence(inputs, promiser);
    } else {
      return await promiseAllAtOnce(inputs, promiser);
    }
  } catch (err) {
    throw new CogniteMultiError(err);
  }
}

/**
 * Resolves Promises sequentially
 */
/** @hidden */
export async function promiseEachInSequence<RequestType, ResponseType>(
  inputs: RequestType[],
  promiser: (input: RequestType) => Promise<ResponseType>
) {
  return inputs.reduce(async (previousPromise, input, index) => {
    const prevResult = await previousPromise;
    try {
      return prevResult.concat(await promiser(input));
    } catch (err) {
      throw {
        errors: [err],
        failed: inputs.slice(index),
        succeded: inputs.slice(0, index),
        responses: prevResult,
      };
    }
  }, Promise.resolve(new Array<ResponseType>()));
}

/** @hidden */
export function isSameProject(project1: string, project2: string): boolean {
  return project1.toLowerCase() === project2.toLowerCase();
}

/** @hidden */
export function applyIfApplicable<ArgumentType, ResultType>(
  args: ArgumentType,
  action?: (input: ArgumentType) => ResultType
) {
  if (action) {
    return action(args);
  }
  return args;
}

/** @hidden */
export function generatePopupWindow(url: string, name: string) {
  return window.open(
    url,
    name,
    // https://www.quackit.com/javascript/popup_windows.cfm
    'height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes'
  );
}

/** @hidden */
export function createInvisibleIframe(
  url: string,
  name: string
): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.name = name;
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  iframe.setAttribute('id', name);
  iframe.setAttribute('aria-hidden', 'true');

  iframe.src = url;
  return iframe;
}

/** @hidden */
export function isUsingSSL() {
  return isBrowser() && location.protocol.toLowerCase() === 'https:';
}

/** @hidden */
export function isLocalhost(): boolean {
  return isBrowser() && location.hostname === 'localhost';
}
