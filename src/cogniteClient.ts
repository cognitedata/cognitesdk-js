// Copyright 2019 Cognite AS

import { version } from '@/../package.json';
import { MetadataMap } from '@/metadata';
import { AssetMappings3DAPI } from '@/resources/3d/assetMappings3DApi';
import { Files3DAPI } from '@/resources/3d/files3DApi';
import { Models3DAPI } from '@/resources/3d/models3DApi';
import { Revisions3DAPI } from '@/resources/3d/revisions3DApi';
import { Viewer3DAPI } from '@/resources/3d/viewer3DApi';
import { ApiKeysAPI } from '@/resources/apiKeys/apiKeysApi';
import { AssetsAPI } from '@/resources/assets/assetsApi';
import { DataPointsAPI } from '@/resources/dataPoints/dataPointsApi';
import { EventsAPI } from '@/resources/events/eventsApi';
import { FilesAPI } from '@/resources/files/filesApi';
import { GroupsAPI } from '@/resources/groups/groupsApi';
import {
  createAuthenticateFunction,
  OnAuthenticate,
  OnAuthenticateLoginObject,
  OnTokens,
} from '@/resources/login';
import { LoginAPI } from '@/resources/login/loginApi';
import { ProjectsAPI } from '@/resources/projects/projectsApi';
import { RawAPI } from '@/resources/raw/rawApi';
import { SecurityCategoriesAPI } from '@/resources/securityCategories/securityCategoriesApi';
import { ServiceAccountsAPI } from '@/resources/serviceAccounts/serviceAccountsApi';
import { TimeSeriesAPI } from '@/resources/timeSeries/timeSeriesApi';
import { apiUrl, getBaseUrl, projectUrl } from '@/utils';
import { isFunction, isObject, isString } from 'lodash';
import {
  API_KEY_HEADER,
  X_CDF_APP_HEADER,
  X_CDF_SDK_HEADER,
} from './constants';
import { HttpRequestOptions } from './utils/http/basicHttpClient';
import { CDFHttpClient } from './utils/http/cdfHttpClient';

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

export const REDIRECT = 'REDIRECT';
export const POPUP = 'POPUP';
export interface OAuthLoginOptions extends Project {
  onAuthenticate?: OnAuthenticate | 'REDIRECT' | 'POPUP';
  onTokens?: OnTokens;
}

function validateAndReturnAPI<T>(api: T | undefined): T {
  if (api === undefined) {
    throw Error(
      'Need to login with either loginWithApiKey or loginWithOAuth before you can use the Cognite SDK'
    );
  }
  return api;
}

function throwReLogginError() {
  throw Error(
    'You cannot re-login with an already logged in Cognite client instance. Try to create a new Cognite client instance instead.'
  );
}

export default class CogniteClient {
  public get assets() {
    return validateAndReturnAPI(this.assetsApi);
  }
  public get timeseries() {
    return validateAndReturnAPI(this.timeSeriesApi);
  }
  public get datapoints() {
    return validateAndReturnAPI(this.dataPointsApi);
  }
  public get events() {
    return validateAndReturnAPI(this.eventsApi);
  }
  public get files() {
    return validateAndReturnAPI(this.filesApi);
  }
  public get raw() {
    return validateAndReturnAPI(this.rawApi);
  }
  public get projects() {
    return validateAndReturnAPI(this.projectsApi);
  }
  public get groups() {
    return validateAndReturnAPI(this.groupsApi);
  }
  public get securityCategories() {
    return validateAndReturnAPI(this.securityCategoriesApi);
  }
  public get serviceAccounts() {
    return validateAndReturnAPI(this.serviceAccountsApi);
  }
  public get models3D() {
    return validateAndReturnAPI(this.models3DApi);
  }
  public get revisions3D() {
    return validateAndReturnAPI(this.revisions3DApi);
  }
  public get files3D() {
    return validateAndReturnAPI(this.files3DApi);
  }
  public get assetMappings3D() {
    return validateAndReturnAPI(this.assetMappings3DApi);
  }
  public get viewer3D() {
    return validateAndReturnAPI(this.viewer3DApi);
  }
  public get apiKeys() {
    return validateAndReturnAPI(this.apiKeysApi);
  }
  public get login() {
    return this.loginApi;
  }

  private projectName: string = '';
  private httpClient: CDFHttpClient;
  private metadataMap: MetadataMap;
  private hasBeenLoggedIn: boolean = false;
  private assetsApi?: AssetsAPI;
  private timeSeriesApi?: TimeSeriesAPI;
  private dataPointsApi?: DataPointsAPI;
  private eventsApi?: EventsAPI;
  private filesApi?: FilesAPI;
  private rawApi?: RawAPI;
  private projectsApi?: ProjectsAPI;
  private groupsApi?: GroupsAPI;
  private securityCategoriesApi?: SecurityCategoriesAPI;
  private serviceAccountsApi?: ServiceAccountsAPI;
  private models3DApi?: Models3DAPI;
  private revisions3DApi?: Revisions3DAPI;
  private files3DApi?: Files3DAPI;
  private assetMappings3DApi?: AssetMappings3DAPI;
  private viewer3DApi?: Viewer3DAPI;
  private apiKeysApi?: ApiKeysAPI;
  private loginApi: LoginAPI;
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
    this.httpClient = new CDFHttpClient(getBaseUrl(baseUrl));
    this.httpClient
      .setDefaultHeader(X_CDF_SDK_HEADER, `CogniteJavaScriptSDK:${version}`)
      .setDefaultHeader(X_CDF_APP_HEADER, options.appId);

    this.metadataMap = new MetadataMap();
    this.loginApi = new LoginAPI(this.httpClient, this.metadataMap);
  }
  // tslint:disable-next-line:no-identical-functions
  public authenticate: () => Promise<boolean> = async () => {
    throw Error(
      'You can only call authenticate after you have called loginWithOAuth'
    );
  };

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
    ['project', 'apiKey'].forEach(property => {
      // @ts-ignore
      if (!isString(options[property])) {
        throw Error(
          `options.${property} is required and must be of type string`
        );
      }
    });
    this.projectName = project;
    this.httpClient.setDefaultHeader(API_KEY_HEADER, apiKey);

    this.initAPIs();
  };

  /**
   * Login client with OAuth login flow
   * <!-- [Login with redirect](https://doc.cognitedata.com/api/v1/#operation/redirectUrl) -->
   *
   * ```js
   * import { CogniteClient, REDIRECT } from '@cognite/sdk';
   *
   * const client = new CogniteClient({ appId: '[YOUR APP NAME]' });
   *
   * client.loginWithOAuth({
   *   project: '[PROJECT]',
   *   onAuthenticate: REDIRECT // optional, REDIRECT is by default
   * });
   * // after login you can do calls with the client
   * (async () => {
   *   const createdAsset = await client.assets.create([{ name: 'My first asset' }]);
   * })();
   * ```
   *
   * @param options Login options
   */
  public loginWithOAuth = (options: OAuthLoginOptions) => {
    if (this.hasBeenLoggedIn) {
      throwReLogginError();
    }

    if (!isObject(options)) {
      throw Error('`loginWithOAuth` is missing parameter `options`');
    }
    const { project } = options;
    if (!isString(project)) {
      throw Error('options.project is required and must be of type string');
    }
    this.projectName = project;

    const onTokens = options.onTokens || (() => {});
    let onAuthenticate: OnAuthenticate = onAuthenticateWithRedirect;
    if (options.onAuthenticate === POPUP) {
      onAuthenticate = onAuthenticateWithPopup;
    } else if (isFunction(options.onAuthenticate)) {
      onAuthenticate = options.onAuthenticate;
    }
    const authenticate = createAuthenticateFunction({
      project,
      httpClient: this.httpClient,
      onAuthenticate,
      onTokens,
    });

    listenForNonSuccessStatusCode(this.instance, 401, async (error, retry) => {
      // ignore calls to /login/status
      const { config } = error;
      if (config.url === '/login/status') {
        return Promise.reject(error);
      }
      const didAuthenticate = await authenticate();
      return didAuthenticate ? retry() : Promise.reject(error);
    });

    this.initAPIs();
    this.authenticate = authenticate;
  };

  /**
   * To modify the base-url at any point in time
   */
  public setBaseUrl = (baseUrl: string) => {
    this.httpClient.setBaseUrl(baseUrl);
  };

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
  public get = (path: string, options?: HttpRequestOptions) =>
    this.httpClient.get(path, options);

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
  public put = (path: string, options?: HttpRequestOptions) =>
    this.httpClient.put(path, options);

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
  public post = (path: string, options?: HttpRequestOptions) =>
    this.httpClient.post(path, options);

  /**
   * Basic HTTP method for DELETE
   *
   * @param path The URL path
   * @param options Request options, optional
   * ```js
   * const response = await client.delete('someUrl');
   * ```
   */
  public delete = (path: string, options?: HttpRequestOptions) =>
    this.httpClient.delete(path, options);

  private initAPIs = () => {
    const defaultArgs: [CDFHttpClient, MetadataMap] = [
      this.httpClient,
      this.metadataMap,
    ];
    this.assetsApi = new AssetsAPI(
      this,
      projectUrl(this.project) + '/assets',
      ...defaultArgs
    );
    this.timeSeriesApi = new TimeSeriesAPI(
      this,
      projectUrl(this.project) + '/timeseries',
      ...defaultArgs
    );
    this.dataPointsApi = new DataPointsAPI(
      projectUrl(this.project) + '/timeseries',
      ...defaultArgs
    );
    this.eventsApi = new EventsAPI(
      projectUrl(this.project) + '/events',
      ...defaultArgs
    );
    this.filesApi = new FilesAPI(
      projectUrl(this.project) + '/files',
      ...defaultArgs
    );
    this.rawApi = new RawAPI(
      projectUrl(this.project) + '/raw/dbs',
      ...defaultArgs
    );
    this.projectsApi = new ProjectsAPI(apiUrl(), ...defaultArgs);
    this.groupsApi = new GroupsAPI(
      projectUrl(this.project) + '/groups',
      ...defaultArgs
    );
    this.securityCategoriesApi = new SecurityCategoriesAPI(
      projectUrl(this.project) + '/securitycategories',
      ...defaultArgs
    );
    this.serviceAccountsApi = new ServiceAccountsAPI(
      projectUrl(this.project) + '/serviceaccounts',
      ...defaultArgs
    );
    this.apiKeysApi = new ApiKeysAPI(
      projectUrl(this.project) + '/apikeys',
      ...defaultArgs
    );
    const models3DPath = projectUrl(this.project) + '/3d/models';
    this.models3DApi = new Models3DAPI(models3DPath, ...defaultArgs);
    this.revisions3DApi = new Revisions3DAPI(models3DPath, ...defaultArgs);
    this.files3DApi = new Files3DAPI(
      projectUrl(this.project) + '/3d/files',
      ...defaultArgs
    );
    this.assetMappings3DApi = new AssetMappings3DAPI(
      models3DPath,
      ...defaultArgs
    );
    this.viewer3DApi = new Viewer3DAPI(
      projectUrl(this.project) + '/3d',
      ...defaultArgs
    );
  };
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
