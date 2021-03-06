// Copyright 2020 Cognite AS

import { createInvisibleIframe, generatePopupWindow } from './utils';
import { CogniteLoginError } from './loginError';
import { parse, stringify } from 'query-string';
import { HttpCall, HttpQueryParams } from './httpClient/basicHttpClient';
import { LogoutUrlResponse } from './types';
import isString from 'lodash/isString';

const LOGIN_POPUP_NAME = 'cognite-js-sdk-auth-popup';
const LOGIN_IFRAME_NAME = 'silentLoginIframe';

export const ACCESS_TOKEN_PARAM = 'access_token';
export const ID_TOKEN_PARAM = 'id_token';
export const ERROR_PARAM = 'error';
export const ERROR_DESCRIPTION_PARAM = 'error_description';

/** @hidden */
export interface AuthTokens {
  accessToken: string;
  idToken: string;
}

/** @hidden */
export interface AuthorizeParams extends AuthorizeOptions {
  baseUrl: string;
  project: string;
  accessToken?: string;
}
/** @hidden **/
export interface AuthorizeOptions {
  redirectUrl: string;
  errorRedirectUrl?: string;
}

export function isLoginPopupWindow(): boolean {
  return window.name === LOGIN_POPUP_NAME;
}

export function loginPopupHandler() {
  if (!isLoginPopupWindow()) {
    return;
  }
  try {
    const tokens = parseTokenQueryParameters(window.location.search);
    window.opener.postMessage(tokens);
  } catch (err) {
    window.opener.postMessage({ error: err.message });
  } finally {
    window.close();
  }
}

/** @hidden */
export async function getLogoutUrl(get: HttpCall, params: HttpQueryParams) {
  try {
    const response = await get<LogoutUrlResponse>('/logout/url', {
      params,
    });
    return response.data.data.url;
  } catch (err) {
    if (err.status === 401) {
      return null;
    }
    throw err;
  }
}

/** @hidden */
export function parseTokenQueryParameters(query: string): null | AuthTokens {
  const {
    [ACCESS_TOKEN_PARAM]: accessToken,
    [ID_TOKEN_PARAM]: idToken,
    [ERROR_PARAM]: error,
    [ERROR_DESCRIPTION_PARAM]: errorDescription,
  } = parse(query);
  if (error !== undefined) {
    throw Error(`${error}: ${errorDescription}`);
  }
  if (isString(accessToken) && isString(idToken)) {
    return {
      accessToken,
      idToken,
    };
  }
  return null;
}

/** @hidden */
export function loginWithRedirect(params: AuthorizeParams): Promise<void> {
  // @ts-ignore we want to return a promise which never gets resolved (window will redirect)
  return new Promise<void>(() => {
    const url = generateLoginUrl(params);
    window.location.assign(url);
  });
}

/** @hidden */
export function loginWithPopup(
  params: AuthorizeParams
): Promise<null | AuthTokens> {
  return new Promise((resolve, reject) => {
    const url = generateLoginUrl(params);
    const loginPopup = generatePopupWindow(url, LOGIN_POPUP_NAME);
    if (loginPopup === null) {
      reject(new CogniteLoginError('Failed to create login popup window'));
      return;
    }
    const tokenListener = (message: MessageEvent) => {
      if (message.source !== loginPopup) {
        return;
      }
      if (!message.data || message.data.error) {
        reject(new CogniteLoginError());
        return;
      }
      window.removeEventListener('message', tokenListener);
      resolve(message.data);
    };
    window.addEventListener('message', tokenListener, false);
  });
}

/** @hidden **/
export async function silentLoginViaIframe<TokenType>(
  url: string,
  extractor: (query: string) => TokenType,
  iframeName: string = LOGIN_IFRAME_NAME,
  locationPart: 'hash' | 'search' = 'hash'
): Promise<TokenType> {
  return new Promise<TokenType>((resolve, reject) => {
    const iframe = createInvisibleIframe(url, iframeName);

    iframe.onload = () => {
      try {
        const authTokens = extractor(
          iframe.contentWindow!.location[locationPart]
        );
        if (authTokens === null) {
          throw Error('Failed to login silently');
        }
        resolve(authTokens);
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(iframe);
      }
    };
    document.body.appendChild(iframe);
  });
}

function generateLoginUrl(params: AuthorizeParams): string {
  const { project, baseUrl, redirectUrl, errorRedirectUrl } = params;
  const queryParams = {
    project,
    redirectUrl,
    errorRedirectUrl: errorRedirectUrl || redirectUrl,
  };
  return `${baseUrl}/login/redirect?${stringify(queryParams)}`;
}
