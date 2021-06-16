// Copyright 2020 Cognite AS

import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { LoginAPI } from './api/login/loginApi';
import { LogoutApi } from './api/logout/logoutApi';
import {
  API_KEY_HEADER,
  AUTHORIZATION_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from './constants';
import {
  HttpHeaders,
  HttpRequestOptions,
  HttpResponse,
} from './httpClient/basicHttpClient';
import { CDFHttpClient } from './httpClient/cdfHttpClient';
import { MetadataMap } from './metadata';
import {
  bearerString,
  getBaseUrl,
  isUsingSSL,
  projectUrl,
  isBrowser,
} from './utils';
import { version } from '../package.json';
import {
  createUniversalRetryValidator,
  RetryValidator,
} from './httpClient/retryValidator';
import { AzureAD, AzureADSignInType } from './authFlows/aad';
import {
  CogniteAuthentication,
  OnAuthenticate,
  OnTokens,
} from './authFlows/legacy';
import { ADFS, ADFSRequestParams } from './authFlows/adfs';
import { AuthTokens } from './loginUtils';
import {
  OidcClientCredentials,
  OIDCClientCredentialsFlowOptions,
} from './authFlows/oidc_client_credentials_flow';
import { FlowCallbacks, OAuthLoginResult } from './types';

export interface ClientOptions {
  /** App identifier (ex: 'FileExtractor') */
  appId: string;
  baseUrl?: string;
}

export interface Project {
  /**
   * Cognite project to login into
   */
  project: string;
}

export interface ApiKeyLoginOptions extends Project {
  /**
   * A Cognite issued api-key
   */
  apiKey: string;
}

export type AAD_OAUTH = {
  type: 'AAD_OAUTH';
  options: OAuthLoginForAADOptions;
};
export type CDF_OAUTH = {
  type: 'CDF_OAUTH';
  options: OAuthLoginForCogniteOptions;
};
export type ADFS_OAUTH = {
  type: 'ADFS_OAUTH';
  options: OAuthLoginForADFSOptions;
};
export type OIDC_CLIENT_CREDENTIALS_FLOW = {
  type: 'OIDC_CLIENT_CREDENTIALS_FLOW';
  options: OAuthLoginForOIDCVendorGenericFlowOptions;
};
export type AuthFlowType =
  | AAD_OAUTH
  | CDF_OAUTH
  | ADFS_OAUTH
  | OIDC_CLIENT_CREDENTIALS_FLOW;

/**
 * @deprecated
 */
export interface OAuthLoginForCogniteOptions {
  project: string;
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
  onTokens?: OnTokens;
  /**
   * Provide optional cached access token to skip the authentication flow (client.authenticate will still override this).
   */
  accessToken?: string;
  onHandleRedirectError?: (error: string) => void;
}

export interface OAuthLoginForAADOptions {
  cluster: string;
  clientId: string;
  tenantId?: string;
  signInType?: AzureADSignInType;
  onNoProjectAvailable?: () => void;
  debug?: boolean;
}

export interface OAuthLoginForADFSOptions {
  authority: string;
  requestParams: ADFSRequestParams;
  onNoProjectAvailable?: () => void;
}

export type OAuthLoginForOIDCVendorGenericFlowOptions = OIDCClientCredentialsFlowOptions;

export function accessApi<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error(
      'Need to login with either loginWithApiKey or loginWithOAuth before you can use the Cognite SDK'
    );
  }
  return api;
}

export function throwReLogginError() {
  throw Error(
    'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite client instance instead.'
  );
}

export default class BaseCogniteClient {
  public get login() {
    return this.loginApi;
  }
  public get logout() {
    return this.logoutApi;
  }

  private flow?: AuthFlowType;

  private readonly http: CDFHttpClient;
  private readonly metadata: MetadataMap;
  private readonly loginApi: LoginAPI;
  private readonly logoutApi: LogoutApi;
  private projectName: string = '';
  private hasBeenLoggedIn: boolean = false;
  private azureAdClient?: AzureAD;
  private adfsClient?: ADFS;
  private cogniteAuthClient?: CogniteAuthentication;
  private vendorGenericFlowManager?: OidcClientCredentials;

  /**
   * Create a new SDK client
   *
   * @param options Client options
   *
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClient({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   */
  constructor(options: ClientOptions) {
    if (!isObject(options)) {
      throw Error('`CogniteClient` is missing parameter `options`');
    }
    if (!isString(options.appId)) {
      throw Error('options.appId is required and must be of type string');
    }
    const { baseUrl } = options;
    this.http = new CDFHttpClient(
      getBaseUrl(baseUrl),
      this.getRetryValidator()
    );
    this.httpClient
      .setDefaultHeader(X_CDF_APP_HEADER, options.appId)
      .setDefaultHeader(
        X_CDF_SDK_HEADER,
        `CogniteJavaScriptSDK:${this.version}`
      );

    this.metadata = new MetadataMap();
    this.loginApi = new LoginAPI(this.httpClient, this.metadataMap);
    this.logoutApi = new LogoutApi(this.httpClient, this.metadataMap);
  }

  public authenticate: () => Promise<boolean> = async () => {
    throw Error(
      'You can only call authenticate after you have called loginWithOAuth'
    );
  };

  public setProject(projectName: string) {
    this.projectName = projectName;
    this.initAPIs();
  }

  public get project() {
    return this.projectName;
  }

  /**
   * Login client with api-key
   *
   * @param options Login options
   *
   * ```js
   * import { CogniteClient } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: '[YOUR APP NAME]' });
   * client.loginWithApiKey({
   *   apiKey: '[API KEY]',
   *   project: '[PROJECT]',
   * });
   * // after login you can do calls with the client
   * const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * ```
   */
  public loginWithApiKey = (options: ApiKeyLoginOptions) => {
    if (this.hasBeenLoggedIn) {
      throwReLogginError();
    }

    if (!isObject(options)) {
      throw Error('`loginWithApiKey` is missing parameter `options`');
    }
    const { project, apiKey } = options;
    const keys: (keyof ApiKeyLoginOptions)[] = ['project', 'apiKey'];
    for (const property of keys) {
      if (!isString(options[property])) {
        throw Error(
          `options.${property} is required and must be of type string`
        );
      }
    }
    this.httpClient.setDefaultHeader(API_KEY_HEADER, apiKey);

    this.setProject(project);
    this.hasBeenLoggedIn = true;
  };

  /**
   * Sign in client with OAuth login flow
   * <!-- [Login with redirect](https://doc.cognitedata.com/api/v1/#operation/redirectUrl) -->
   *
   * ```js
   * import { CogniteClient, REDIRECT } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: '[YOUR APP NAME]' });
   *
   * // using Cognite authentication flow
   * client.loginWithOAuth({
   *   type: 'CDF_OAUTH',
   *   options: {
   *     project: '[PROJECT]',
   *     onAuthenticate: REDIRECT // optional, REDIRECT is by default
   *   }
   * });
   *
   * // or you can sign in using AzureAD authentication flow (in case your projects supports it)
   * client.loginWithOAuth({
   *   type: 'AAD_OAUTH',
   *   options: {
   *     cluster: '[CLUSTER]',
   *     clientId: '[CLIENT_ID]', // client id of your AzureAD application
   *     tenantId: '[TENANT_ID]', // tenant id of your AzureAD tenant. Will be set to 'common' if not provided
   *   }
   * });
   *
   * // you also have ability to sign in using ADFS
   * client.loginWithOAuth({
   *   type: 'ADFS_OAUTH',
   *   options: {
   *     authority: https://example.com/adfs/oauth2/authorize,
   *     requestParams: {
   *       cluster: 'cluster-name',
   *       clientId: 'adfs-client-id',
   *     },
   *   }
   * });
   *
   * // or with client credentials
   * client.loginWithOAuth({
   *   type: 'OIDC_CLIENT_CREDENTIALS_FLOW',
   *   options: {
   *     clientId: '[CLIENT_ID]',
   *     clientSecret: '[CLIENT_SECRET]',
   *     openIdConfigurationUrl:  https://login.microsoftonline.com/[AZURE_TENANT_ID]/v2.0/.well-known/openid-configuration,
   *   }
   * });
   *
   * // after sign in you can do calls with the client
   * (async () => {
   *   await client.authenticate();
   *   client.setProject('project-name');
   *   const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * })();
   * ```
   *
   * @param options Login options
   */
  public loginWithOAuth = async (flow: AuthFlowType): Promise<boolean> => {
    let token = null;

    if (this.hasBeenLoggedIn) {
      throwReLogginError();
    }

    if (!flow || !flow.type) {
      throw Error('`loginWithOAuth` is missing parameter `flow`');
    }
    if (!flow.options) {
      throw Error('`loginWithOAuth` is missing parameter `options`');
    }

    if (isBrowser() && !isUsingSSL()) {
      console.warn(
        'You should use SSL (https) when you login with OAuth since CDF only allows redirecting back to an HTTPS site'
      );
    }

    this.flow = flow;

    let authenticate: () => Promise<boolean>;

    const callbacks: FlowCallbacks = {
      setCluster: this.httpClient.setCluster,
      setBearerToken: this.httpClient.setBearerToken,
      validateAccessToken: this.validateAccessToken,
    };

    switch (flow.type) {
      case 'CDF_OAUTH': {
        [authenticate, token] = await this.loginWithCognite(flow.options);
        break;
      }
      case 'AAD_OAUTH': {
        [authenticate, token] = await this.loginWithAAD(flow.options);
        break;
      }
      case 'ADFS_OAUTH': {
        [authenticate, token] = await this.loginWithADFS(flow.options);
        break;
      }
      case 'OIDC_CLIENT_CREDENTIALS_FLOW': {
        [
          authenticate,
          token,
        ] = await (this.vendorGenericFlowManager = new OidcClientCredentials(
          flow.options,
          callbacks
        )).init();
        break;
      }
      default: {
        throw Error('`loginWithOAuth` is missing correct `options` structure');
      }
    }

    this.httpClient.set401ResponseHandler(async (_, retry, reject) => {
      const didAuthenticate = await authenticate();
      return didAuthenticate ? retry() : reject();
    });

    if (token) {
      this.httpClient.setBearerToken(token);
    }

    this.authenticate = authenticate;
    this.hasBeenLoggedIn = true;

    return token !== null;
  };

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    if (
      this.flow &&
      (this.flow.type === 'AAD_OAUTH' ||
        this.flow.type === 'OIDC_CLIENT_CREDENTIALS_FLOW')
    ) {
      throw Error('`setBaseUrl` does not available with Azure AD auth flow');
    }
    this.httpClient.setBaseUrl(baseUrl);
  };

  /**
   * Returns the base-url used for all requests.
   */
  public getBaseUrl(): string {
    return this.httpClient.getBaseUrl();
  }

  /**
   * Provides information about which OAuth flow has been used
   */
  public getOAuthFlowType(): AuthFlowType['type'] | undefined {
    return this.flow && this.flow.type;
  }

  /**
   * Returns CDF token in case of AzureAD authentication flow usage.
   * This token can be used to CDF endpoints
   *
   * ```js
   * client.loginWithOAuth({ type: 'AAD_OAUTH', options: {cluster: 'bluefield', ...}});
   * await client.authenticate();
   * const cdfToken = await client.getCDFToken();
   * ```
   */
  public async getCDFToken(): Promise<string | null> {
    switch (this.flow!.type) {
      case 'CDF_OAUTH': {
        const tokens =
          (await this.cogniteAuthClient!.getCDFToken(this.httpClient)) || null;
        return tokens ? tokens.accessToken : null;
      }
      case 'AAD_OAUTH': {
        const token = await this.azureAdClient!.getCDFToken();

        if (token && !(await this.validateAccessToken(token))) {
          return null;
        }
        return token;
      }
      case 'ADFS_OAUTH': {
        const token = await this.adfsClient!.getCDFToken();
        if (token && !(await this.validateAccessToken(token))) {
          return null;
        }
        return token;
      }
      case 'OIDC_CLIENT_CREDENTIALS_FLOW': {
        return this.vendorGenericFlowManager!.getCdfToken() || null;
      }
      default: {
        throw Error('CDF token can be acquired only using loginWithOAuth flow');
      }
    }
  }

  /**
   * Returns Azure AD access token in case of AzureAD authentication flow usage.
   * Can be used for getting user details via Microsoft Graph API
   *
   * ```js
   * client.loginWithOAuth({ type: 'AAD_OAUTH', options: {cluster: 'bluefield', ...});
   * await client.authenticate();
   * const accessToken = await client.getAzureADAccessToken();
   * ```
   */
  public getAzureADAccessToken(): Promise<string | null> {
    if (!this.azureAdClient) {
      throw Error(
        'Azure AD access token can be acquired only using AzureAD auth flow'
      );
    }

    return this.azureAdClient.getAccountToken();
  }

  /**
   * Returns the default HTTP request headers, including e.g. authentication
   * headers that is included in all requests. Headers provided per-requests is not
   * included in this list. This function is useful when constructing API requests
   * outside the SDK.
   *
   * ```js
   * const customUrl = '...';
   * const headers = client.getDefaultRequestHeaders();
   * const result = await fetch(customUrl, { headers });
   * ```
   */
  public getDefaultRequestHeaders(): HttpHeaders {
    return { ...this.httpClient.getDefaultHeaders() };
  }

  /**
   * Lookup response metadata from an request using the response as the parameter
   *
   * ```js
   * const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * const metadata = client.getMetadata(createdAsset);
   * ```
   */
  public getMetadata = (value: any) => this.metadataMap.get(value);

  /**
   * Basic HTTP method for GET
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   * ```js
   * const response = await client.get('/api/v1/projects/{project}/assets', { params: { limit: 50 }});
   * ```
   */
  public get = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.get<T>(path, options);

  /**
   * Basic HTTP method for PUT
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   * ```js
   * const response = await client.put('someUrl');
   * ```
   */
  public put = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.put<T>(path, options);

  /**
   * Basic HTTP method for POST
   *
   * @param path The URL path
   * @param options Request options, optional
   *
   * ```js
   * const assets = [{ name: 'First asset' }, { name: 'Second asset' }];
   * const response = await client.post('/api/v1/projects/{project}/assets', { data: { items: assets } });
   * ```
   */
  public post = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.post<T>(path, options);

  /**
   * Basic HTTP method for DELETE
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.delete('someUrl');
   * ```
   */
  public delete = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.delete<T>(path, options);

  /**
   * Basic HTTP method for PATCH
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.patch('someUrl');
   * ```
   */
  public patch = <T = any>(path: string, options?: HttpRequestOptions) =>
    this.httpClient.patch<T>(path, options);

  public setOneTimeSdkHeader(value: string) {
    this.httpClient.addOneTimeHeader(X_CDF_SDK_HEADER, value);
  }

  protected initAPIs() {
    // will be overritten by subclasses
  }

  /**
   * Returns the retry validator to be used in the http client.
   * Override to provide a better validator
   */
  protected getRetryValidator(): RetryValidator {
    return createUniversalRetryValidator();
  }

  protected get version() {
    return `${version}-core`;
  }

  protected apiFactory = <ApiType>(
    api: new (
      relativePath: string,
      httpClient: CDFHttpClient,
      map: MetadataMap
    ) => ApiType,
    relativePath: string
  ) => {
    return new api(
      `${this.projectUrl}/${relativePath}`,
      this.httpClient,
      this.metadataMap
    );
  };

  protected get projectUrl() {
    return projectUrl(this.project);
  }

  protected get metadataMap() {
    return this.metadata;
  }

  protected get httpClient() {
    return this.http;
  }

  protected loginWithAAD = async ({
    cluster,
    clientId,
    tenantId,
    signInType,
    onNoProjectAvailable = noop,
    debug,
  }: OAuthLoginForAADOptions): Promise<OAuthLoginResult> => {
    const config = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
        redirectUri: `${window.location.origin}`,
        navigateToLoginRequestUrl: true,
      },
    };

    const azureAdClient = new AzureAD({ config, cluster, debug });

    this.httpClient.setCluster(azureAdClient.getCluster());

    let token = await this.handleAzureADLoginRedirect(azureAdClient);

    if (token && !(await this.validateAccessToken(token))) {
      token = null;

      onNoProjectAvailable();
    }

    const authenticate = async () => {
      let cdfAccessToken;

      try {
        cdfAccessToken = await azureAdClient.getCDFToken();
      } catch {
        noop();
      }

      if (!cdfAccessToken) {
        await azureAdClient.login(signInType);

        cdfAccessToken = await azureAdClient.getCDFToken();

        if (!cdfAccessToken) {
          return false;
        }
      }

      if (!(await this.validateAccessToken(cdfAccessToken))) {
        onNoProjectAvailable();

        return false;
      }

      this.httpClient.setBearerToken(cdfAccessToken);

      return true;
    };

    this.azureAdClient = azureAdClient;

    return [authenticate, token];
  };

  protected loginWithADFS = async ({
    authority,
    requestParams,
    onNoProjectAvailable = noop,
  }: OAuthLoginForADFSOptions): Promise<OAuthLoginResult> => {
    const { resource } = requestParams;
    const adfsClient = new ADFS({
      authority,
      requestParams: { ...requestParams },
    });

    this.httpClient.setBaseUrl(resource);

    let token = await this.handleADFSLoginRedirect(adfsClient);

    if (token && !(await this.validateAccessToken(token))) {
      token = null;

      onNoProjectAvailable();
    }

    const authenticate = async () => {
      let cdfAccessToken: null | string = await adfsClient.getCDFToken();

      if (!cdfAccessToken) {
        cdfAccessToken = (await adfsClient.login()) as string;
      }

      if (!(await this.validateAccessToken(cdfAccessToken))) {
        onNoProjectAvailable();

        return false;
      }

      this.httpClient.setBearerToken(cdfAccessToken);

      return true;
    };

    this.adfsClient = adfsClient;

    return [authenticate, token];
  };

  protected loginWithCognite = async ({
    project,
    accessToken,
    onTokens = noop,
    onAuthenticate,
    onHandleRedirectError,
  }: OAuthLoginForCogniteOptions): Promise<OAuthLoginResult> => {
    let token: string | null = null;

    if (!isString(project)) {
      throw Error('options.project is required and must be of type string');
    }

    if (accessToken) {
      this.httpClient.setBearerToken(accessToken);
    }

    const cogniteAuthClient = new CogniteAuthentication({ project });
    let authTokens: AuthTokens | null = null;

    try {
      authTokens = await cogniteAuthClient.handleLoginRedirect(this.httpClient);
    } catch (error) {
      if (onHandleRedirectError) {
        onHandleRedirectError(error.message);
      }
    }

    if (authTokens) {
      token = authTokens.accessToken;
    }

    if (authTokens && onTokens) {
      onTokens(authTokens);
    }

    this.setProject(project);

    const authenticate = async () => {
      let authTokens = await cogniteAuthClient.getCDFToken(this.httpClient);

      if (!authTokens) {
        const baseUrl = getBaseUrl(this.httpClient.getBaseUrl());

        authTokens = await cogniteAuthClient.login({
          baseUrl,
          onAuthenticate,
        });
      }

      if (!authTokens) {
        return false;
      }

      this.httpClient.setBearerToken(authTokens.accessToken);

      if (onTokens) {
        onTokens(authTokens);
      }

      return true;
    };

    this.cogniteAuthClient = cogniteAuthClient;

    return [authenticate, token];
  };

  protected async handleAzureADLoginRedirect(
    azureAdClient: AzureAD
  ): Promise<string | null> {
    const account = await azureAdClient.initAuth();
    let token: string | null = null;

    if (!account) return null;

    try {
      token = await azureAdClient.getCDFToken();
    } catch {
      noop();
    }

    return token;
  }

  protected async handleADFSLoginRedirect(
    adfsClient: ADFS
  ): Promise<string | null> {
    const token = await adfsClient.handleLoginRedirect();

    if (token) {
      return token.accessToken;
    } else {
      const cdfToken = await adfsClient.getCDFToken();

      return cdfToken || null;
    }
  }

  protected validateAccessToken = async (token: string): Promise<boolean> => {
    try {
      const response = await this.httpClient.get<any>('/api/v1/token/inspect', {
        headers: { [AUTHORIZATION_HEADER]: bearerString(token) },
      });

      const { projects } = response.data;

      return !!projects.length;
    } catch (err) {
      if (err.status === 401) {
        return false;
      }

      throw err;
    }
  };
}

export type BaseRequestOptions = HttpRequestOptions;
export type Response = HttpResponse<any>;
