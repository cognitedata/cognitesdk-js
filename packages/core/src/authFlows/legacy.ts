// Copyright 2020 Cognite AS

import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { CDFHttpClient } from '../httpClient/cdfHttpClient';
import {
  bearerString,
  clearParametersFromUrl,
  isLocalhost,
  isSameProject,
  isUsingSSL,
} from '../utils';
import { CogniteLoginError } from '../loginError';
import { AUTHORIZATION_HEADER } from '../constants';
import { HttpCall, HttpHeaders } from '../httpClient/basicHttpClient';
import * as LoginUtils from '../loginUtils';
import {
  ACCESS_TOKEN_PARAM,
  AuthorizeOptions,
  AuthTokens,
  ERROR_DESCRIPTION_PARAM,
  ERROR_PARAM,
  ID_TOKEN_PARAM,
  parseTokenQueryParameters,
} from '../loginUtils';

export const REDIRECT = 'REDIRECT';
export const POPUP = 'POPUP';

export type OnTokens = (tokens: AuthTokens) => void;
export type OnAuthenticate = (login: OnAuthenticateLoginObject) => void;

export interface AuthOptions {
  project: string;
}

export interface LoginParams {
  baseUrl: string;
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
}

export interface IdInfo {
  projectId: number;
  project: string;
  user: string;
}

export interface OnAuthenticateLoginObject {
  redirect: (options: AuthorizeOptions) => void;
  popup: (options: AuthorizeOptions) => void;
  skip: () => void;
}

/** @hidden */
export interface AuthenticateParams {
  project: string;
}

/** @hidden */
export async function getIdInfo(
  get: HttpCall,
  headers: HttpHeaders
): Promise<null | IdInfo> {
  try {
    const response = await get<any>('/login/status', { headers });
    const { loggedIn, user, project, projectId } = response.data.data;
    if (!loggedIn) {
      return null;
    }
    return {
      user,
      project,
      projectId,
    };
  } catch (err) {
    if (err.status === 401) {
      return null;
    }
    throw err;
  }
}

export class CogniteAuthentication {
  private readonly project: string;
  private authTokens?: AuthTokens;

  constructor({ project }: AuthOptions) {
    if (!isString(project)) {
      throw Error('options.project is required and must be of type string');
    }

    this.project = project;
  }

  public login({
    onAuthenticate: onAuthMethod,
    baseUrl,
  }: LoginParams): Promise<AuthTokens | null> {
    const onAuthenticate =
      onAuthMethod === POPUP
        ? onAuthenticateWithPopup
        : isFunction(onAuthMethod)
          ? onAuthMethod
          : onAuthenticateWithRedirect;
    return new Promise((resolve, reject) => {
      const login: OnAuthenticateLoginObject = {
        skip: () => {
          resolve(null);
        },
        redirect: params => {
          const authorizeParams = {
            baseUrl,
            project: this.project,
            ...params,
          };
          LoginUtils.loginWithRedirect(authorizeParams).catch(reject);
        },
        popup: async params => {
          const authorizeParams = {
            baseUrl,
            project: this.project,
            ...params,
          };
          try {
            const tokens = await LoginUtils.loginWithPopup(authorizeParams);

            if (tokens) {
              this.setTokens(tokens);
              resolve(tokens);
            } else {
              reject(new CogniteLoginError());
            }
          } catch (error) {
            reject(error);
          }
        },
      };
      onAuthenticate(login);
    });
  }

  public async getCDFToken(
    httpClient: CDFHttpClient
  ): Promise<AuthTokens | null> {
    if (this.authTokens) {
      const { accessToken, idToken } = this.authTokens;
      const isValid = await isTokensValid(httpClient, this.project, {
        accessToken,
        idToken,
      });

      if (isValid) {
        return { accessToken, idToken };
      }
    }

    return null;
  }

  public async handleLoginRedirect(
    httpClient: CDFHttpClient
  ): Promise<AuthTokens | null> {
    if (!isUsingSSL() && !isLocalhost()) {
      return null;
    }

    const tokens = extractTokensFromUrl();

    if (
      tokens !== null &&
      (await isTokensValid(httpClient, this.project, tokens))
    ) {
      clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);

      this.setTokens(tokens);

      return tokens;
    }

    return null;
  }

  private setTokens({ accessToken, idToken }: AuthTokens) {
    this.authTokens = { accessToken, idToken };
  }
}

function extractTokensFromUrl() {
  try {
    const tokens = parseTokenQueryParameters(window.location.search);
    clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);
    return tokens;
  } catch (err) {
    clearParametersFromUrl(ERROR_PARAM, ERROR_DESCRIPTION_PARAM);
    throw err;
  }
}

function onAuthenticateWithRedirect(login: OnAuthenticateLoginObject) {
  login.redirect({
    redirectUrl: window.location.href,
  });
}

function onAuthenticateWithPopup(login: OnAuthenticateLoginObject) {
  login.popup({
    redirectUrl: window.location.href,
  });
}

async function isTokensValid(
  httpClient: CDFHttpClient,
  project: string,
  tokens: AuthTokens
) {
  const idInfo = await getIdInfoFromAccessToken(httpClient, tokens.accessToken);
  return idInfo !== null && isSameProject(idInfo.project, project);
}

function getIdInfoFromAccessToken(
  httpClient: CDFHttpClient,
  accessToken: string
): Promise<null | IdInfo> {
  return getIdInfo(httpClient.get.bind(httpClient), {
    [AUTHORIZATION_HEADER]: bearerString(accessToken),
  });
}
