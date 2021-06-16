// Copyright 2020 Cognite AS

import nock from 'nock';
import BaseCogniteClient from '../baseCogniteClient';
import { POPUP, REDIRECT } from '../authFlows/legacy';
import {
  API_KEY_HEADER,
  AUTHORIZATION_HEADER,
  X_CDF_SDK_HEADER,
  BASE_URL,
} from '../constants';
import * as LoginUtils from '../loginUtils';
import { ADFS } from '../authFlows/adfs';
import { bearerString, sleepPromise } from '../utils';
import { apiKey, authTokens, loggedInResponse, project } from '../testUtils';
import { TokenSet } from 'openid-client';

const initAuth = jest.fn();
const login = jest.fn();
const getCDFToken = jest.fn();
const getCluster = jest.fn();

jest.mock('../authFlows/aad', () => {
  return {
    AzureAD: jest.fn().mockImplementation(() => {
      return {
        initAuth,
        login,
        getCDFToken,
        getCluster,
      };
    }),
  };
});

const openidInit = jest.fn();
const openidGetCDFToken = jest.fn();
const openidGetAuthTokens = jest.fn();

jest.mock('../authFlows/oidc_client_credentials_flow', () => {
  return {
    OidcClientCredentials: jest.fn().mockImplementation(() => {
      return {
        init: openidInit,
        getCDFToken: openidGetCDFToken,
        getAuthTokens: openidGetAuthTokens,
      };
    }),
  };
});

const mockBaseUrl = 'https://example.com';
const cdfToken = 'azure-ad-CDF-token';

function setupClient(baseUrl: string = BASE_URL) {
  return new BaseCogniteClient({ appId: 'JS SDK integration tests', baseUrl });
}

function setupMockableClient() {
  const client = setupClient(mockBaseUrl);
  client.loginWithApiKey({
    project,
    apiKey,
  });
  return client;
}

describe('CogniteClient', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe('constructor', () => {
    test('throw on missing parameter', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient();
      }).toThrowErrorMatchingInlineSnapshot(
        `"\`CogniteClient\` is missing parameter \`options\`"`
      );
    });

    test('missing appId', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({});
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.appId is required and must be of type string"`
      );
    });

    test('invalid appId', () => {
      expect(() => {
        // @ts-ignore
        new BaseCogniteClient({ appId: 12 });
      }).toThrowErrorMatchingInlineSnapshot(
        `"options.appId is required and must be of type string"`
      );
    });
  });

  describe('loginWithApiKey', () => {
    test('missing parameter', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithApiKey()
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithApiKey\` is missing parameter \`options\`"`
      );
    });

    test('missing project', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithApiKey({})
      ).toThrowErrorMatchingInlineSnapshot(
        `"options.project is required and must be of type string"`
      );
    });

    test('missing api key', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithApiKey({ project })
      ).toThrowErrorMatchingInlineSnapshot(
        `"options.apiKey is required and must be of type string"`
      );
    });

    test('create client with invalid api-key/project', async () => {
      const client = setupClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
    });

    test('set correct apikey', async () => {
      const client = setupMockableClient();
      nock(mockBaseUrl, { reqheaders: { [API_KEY_HEADER]: apiKey } })
        .get('/test')
        .reply(200, {});
      await client.get('/test');
      expect(client.getDefaultRequestHeaders()).toMatchObject({
        [API_KEY_HEADER]: apiKey,
      });
    });

    test('set correct project', async () => {
      const client = setupClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
      expect(client.project).toBe(project);
    });
    test('fails to return oauth flow type', () => {
      const client = setupClient();
      client.loginWithApiKey({
        project,
        apiKey,
      });
      expect(client.getOAuthFlowType()).toEqual(undefined);
    });
  });

  test('getDefaultRequestHeaders() returns clone', () => {
    const client = setupMockableClient();
    const headers = client.getDefaultRequestHeaders();
    headers[API_KEY_HEADER] = 'overriden';
    const expectedHeaders = { [API_KEY_HEADER]: apiKey };
    nock(mockBaseUrl, { reqheaders: expectedHeaders })
      .get('/')
      .reply(200, {});
  });

  test('getBaseUrl() returns set value', () => {
    const baseUrl = 'https://example.com';
    const client = setupMockableClient();
    client.setBaseUrl(baseUrl);
    expect(client.getBaseUrl()).toEqual(baseUrl);
  });

  describe('http requests', () => {
    let client: BaseCogniteClient;

    beforeAll(async () => {
      client = setupMockableClient();
    });

    test('get method', async () => {
      nock(mockBaseUrl)
        .get('/')
        .once()
        .reply(200, []);
      const response = await client.get('/');
      expect(response.data).toEqual([]);
    });

    test('post method', async () => {
      nock(mockBaseUrl)
        .post('/')
        .once()
        .reply(200, []);
      const response = await client.post('/');
      expect(response.data).toEqual([]);
    });

    test('put method', async () => {
      nock(mockBaseUrl)
        .put('/')
        .once()
        .reply(200, []);
      const response = await client.put('/', {
        responseType: 'json',
      });
      expect(response.data).toEqual([]);
    });

    test('delete method', async () => {
      nock(mockBaseUrl)
        .delete('/')
        .once()
        .reply(200, 'abc');
      const response = await client.delete('/', { responseType: 'text' });
      expect(response.data).toBe('abc');
    });
  });

  describe('loginWithOAuth', () => {
    test('missing parameter', async () => {
      const client = setupClient();
      await expect(
        // @ts-ignore
        async () => await client.loginWithOAuth()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithOAuth\` is missing parameter \`flow\`"`
      );
      await expect(
        // @ts-ignore
        async () => await client.loginWithOAuth({ type: 'CDF_OAUTH' })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithOAuth\` is missing parameter \`options\`"`
      );
    });

    test('invalid flow type', async () => {
      const client = setupClient();
      await expect(
        async () =>
          // @ts-ignore
          await client.loginWithOAuth({ type: 'INVALID_FLOW', options: {} })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithOAuth\` is missing correct \`options\` structure"`
      );
    });

    describe('authentication with cognite', () => {
      let mockRedirect: jest.SpyInstance;
      let mockPopup: jest.SpyInstance;

      beforeEach(() => {
        mockRedirect = jest.spyOn(LoginUtils, 'loginWithRedirect');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockRedirect.mockImplementation(async () => {});

        mockPopup = jest.spyOn(LoginUtils, 'loginWithPopup');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockPopup.mockImplementation(async () => {});
      });

      afterEach(() => {
        mockRedirect.mockRestore();
      });

      test('default onAuthenticate function should be redirect', async done => {
        const client = setupClient();
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: { project },
        });
        mockRedirect.mockImplementationOnce(async () => {
          done();
        });
        client.authenticate();
      });

      test('should return cdf oauth flow type in case cdf oauth usage', async () => {
        const client = setupClient();
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate: POPUP,
          },
        });
        mockPopup.mockImplementationOnce(async () => {
          return {};
        });
        await client.authenticate();

        expect(client.getOAuthFlowType()).toEqual('CDF_OAUTH');
      });

      test('onAuthenticate: REDIRECT', async done => {
        const client = setupClient();
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate: REDIRECT,
          },
        });
        mockRedirect.mockImplementationOnce(async () => {
          done();
        });
        await client.authenticate();
      });

      test('onAuthenticate: POPUP', async done => {
        const client = setupClient();
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate: POPUP,
          },
        });
        mockPopup.mockImplementationOnce(async () => {
          done();
          return {};
        });
        await client.authenticate();
      });

      test('should call onAuthenticate on 401', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate,
          },
        });
        onAuthenticate.mockImplementation(login => {
          login.skip();
        });
        nock(mockBaseUrl)
          .get('/401')
          .once()
          .reply(401, {});
        await expect(
          client.get('/401')
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Request failed | status code: 401"`
        );
        expect(onAuthenticate).toHaveBeenCalledTimes(1);
      });

      test('should send one-time header again after silent login', async () => {
        window.history.pushState(
          {},
          '',
          `/some/random/path?query=true&access_token=${
            authTokens.accessToken
          }&id_token=${authTokens.idToken}&random=123`
        );

        const disposableSdkHeader = 'something';
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);

        nock(mockBaseUrl, {
          reqheaders: {
            [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
          },
        })
          .get('/login/status')
          .once()
          .reply(200, loggedInResponse);

        const isAuthenticated = await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate,
          },
        });

        client.setOneTimeSdkHeader(disposableSdkHeader);

        const reqheaders = { [X_CDF_SDK_HEADER]: disposableSdkHeader };
        const normalReqheaders = { [X_CDF_SDK_HEADER]: /CogniteJavaScriptSDK/ };

        nock(mockBaseUrl, { reqheaders })
          .get('/')
          .once()
          .reply(200, {});
        nock(mockBaseUrl, { reqheaders: normalReqheaders })
          .get('/')
          .once()
          .reply(200, {});

        await client.get('/');
        await client.get('/');

        expect(isAuthenticated).toEqual(true);
      });

      test('manually trigger authentication', async () => {
        const onAuthenticate = jest.fn().mockImplementationOnce(login => {
          login.skip();
        });
        const client = setupClient(mockBaseUrl);
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate,
          },
        });
        await expect(client.authenticate()).resolves.toBe(false);
      });

      test('handle error query params', async () => {
        const onHandleRedirectError = jest.fn();
        window.history.pushState(
          {},
          '',
          `/some/random/path?query=true&error=failed&error_description=message`
        );
        const client = setupClient(mockBaseUrl);
        const result = await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onHandleRedirectError,
          },
        });

        expect(result).toEqual(false);
        expect(onHandleRedirectError).toHaveBeenCalledWith('failed: message');
      });

      test('retry request after silent login', async () => {
        const spiedLoginWithPopUp = jest
          .spyOn(LoginUtils, 'loginWithPopup')
          .mockResolvedValueOnce(authTokens);
        const client = setupClient(mockBaseUrl);
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate: POPUP,
          },
        });
        nock(mockBaseUrl, { badheaders: [AUTHORIZATION_HEADER] })
          .get('/')
          .once()
          .reply(401, {});
        nock(mockBaseUrl, {
          reqheaders: {
            [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
          },
        })
          .get('/')
          .once()
          .reply(200, []);
        const response = await client.get('/');

        expect(response.data).toEqual([]);

        spiedLoginWithPopUp.mockReset();
      });

      test("don't call onAuthenticate twice when first call hasn't returned yet", async () => {
        const client = setupClient(mockBaseUrl);
        const onAuthenticate = jest.fn().mockImplementationOnce(async login => {
          await sleepPromise(100);
          login.skip();
        });
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: {
            project,
            onAuthenticate,
          },
        });
        nock(mockBaseUrl)
          .get('/401')
          .once()
          .reply(401);
        let promise401Throwed = false;
        client.get('/401').catch(() => {
          promise401Throwed = true;
        });
        const promiseAuthenticate = client.authenticate();
        await sleepPromise(200);
        expect(onAuthenticate).toBeCalledTimes(1);
        expect(promise401Throwed).toBe(true);
        await expect(promiseAuthenticate).resolves.toBe(false);
      });

      describe('cached access token', () => {
        test('should be able to provide an access token', async () => {
          const client = setupClient(mockBaseUrl);
          await client.loginWithOAuth({
            type: 'CDF_OAUTH',
            options: {
              project,
              accessToken: authTokens.accessToken,
            },
          });
          nock(mockBaseUrl, {
            reqheaders: {
              [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
            },
          })
            .get('/')
            .once()
            .reply(200, {});
          await client.get('/');
        });

        test('re-authenticate on 401', async done => {
          const client = setupClient(mockBaseUrl);
          await client.loginWithOAuth({
            type: 'CDF_OAUTH',
            options: {
              project,
              accessToken: authTokens.accessToken,
              onAuthenticate: () => done(),
            },
          });
          nock(mockBaseUrl)
            .get('/')
            .once()
            .reply(401, {});
          client.get('/');
        });

        test('get cdf token with cognite auth flow', async () => {
          const client = setupClient(mockBaseUrl);
          await client.loginWithOAuth({
            type: 'CDF_OAUTH',
            options: {
              project,
              onAuthenticate: POPUP,
            },
          });
          mockPopup.mockImplementationOnce(async () => {
            return { ...authTokens };
          });
          nock(mockBaseUrl)
            .get('/login/status')
            .once()
            .reply(200, loggedInResponse);

          const result = await client.authenticate();
          const tokens = await client.getCDFToken();

          expect(result).toEqual(true);
          expect(tokens).toEqual(authTokens.accessToken);
        });

        test("get cdf token as null if it's outdated with cognite auth flow", async () => {
          const client = setupClient(mockBaseUrl);
          await client.loginWithOAuth({
            type: 'CDF_OAUTH',
            options: {
              project,
              onAuthenticate: POPUP,
            },
          });
          mockPopup.mockImplementationOnce(async () => {
            return { ...authTokens };
          });

          // assuming that tokens outdated
          nock(mockBaseUrl)
            .get('/login/status')
            .once()
            .reply(401, {});

          const result = await client.authenticate();
          const tokens = await client.getCDFToken();

          expect(result).toEqual(true);
          expect(tokens).toEqual(null);
        });
      });
    });

    describe('authentication with client credentials', () => {
      const clientId = 'clientId';
      const clientSecret = 'clientSecret';
      const openIdConfigurationUrl = `https://login.microsoftonline.com/<TEST>/v2.0/.well-known/openid-configuration`;
      const cluster = 'test-cluster';
      const scope = 'https://bluefield.cognitedata.com/.default';
      const authenticate = jest.fn();

      let client: BaseCogniteClient;

      beforeEach(() => {
        client = new BaseCogniteClient({ appId: 'test-app' });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });

      test('should return true when authenticated', async () => {
        openidInit.mockResolvedValueOnce([authenticate, null]);
        authenticate.mockResolvedValueOnce(true);
        openidGetAuthTokens.mockResolvedValueOnce({
          access_token: cdfToken,
        } as TokenSet);

        const result = await client.loginWithOAuth({
          type: 'OIDC_CLIENT_CREDENTIALS_FLOW',
          options: {
            clientId,
            clientSecret,
            cluster,
            openIdConfigurationUrl,
            scope,
          },
        });

        expect(openidInit).toHaveBeenCalledTimes(1);
        expect(result).toEqual(false);
        const authenticateResult = await client.authenticate();
        expect(authenticateResult).toEqual(true);
      });
    });

    describe('authentication with azure ad', () => {
      const clientId = 'clientId';
      const tenantId = 'tenantId';
      const cluster = 'test-cluster';
      const mockClusterUrl = `https://${cluster}.cognitedata.com`;
      let client: BaseCogniteClient;

      beforeEach(() => {
        client = new BaseCogniteClient({ appId: 'test-app' });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });

      test('should auth with azure ad silently if account is cached', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(200, { projects: ['project1', 'project2'] });
        initAuth.mockResolvedValueOnce('account');
        getCDFToken.mockResolvedValueOnce(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        const result = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            tenantId,
            cluster,
          },
        });

        expect(login).toHaveBeenCalledTimes(0);
        expect(result).toEqual(true);
      });
      test('should auth with azure ad via popup window', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(200, { projects: ['project1', 'project2'] });
        getCDFToken.mockResolvedValueOnce(null);
        getCDFToken.mockResolvedValueOnce(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            tenantId,
            cluster,
            signInType: { type: 'loginPopup' },
          },
        });

        const result = await client.authenticate();

        expect(login).toHaveBeenCalledWith({ type: 'loginPopup' });
        expect(result).toEqual(true);
      });
      test('should return authenticate false in case missed cdf token', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(200, { projects: ['project1', 'project2'] });
        getCDFToken.mockResolvedValueOnce(undefined);
        getCluster.mockReturnValueOnce(cluster);

        const oAuthResult = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            tenantId,
            cluster,
          },
        });
        const authResult = await client.authenticate();

        expect(oAuthResult).toEqual(false);
        expect(authResult).toEqual(false);
      });
      test('should return CDF token in case azure ad auth flow', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .twice()
          .reply(200, { projects: ['project1', 'project2'] });
        getCDFToken.mockResolvedValue(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        const oAuthResult = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            tenantId,
            cluster,
          },
        });

        const authResult = await client.authenticate();
        const token = await client.getCDFToken();

        expect(oAuthResult).toEqual(false);
        expect(authResult).toEqual(true);
        expect(token).toEqual(cdfToken);
      });
      test('should login silently in case valid account from local storage', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .twice()
          .reply(200, { projects: ['project1', 'project2'] });
        initAuth.mockResolvedValueOnce('account');
        getCDFToken.mockResolvedValue(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        const oAuthResult = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            cluster,
          },
        });

        const authResult = await client.authenticate();

        expect(oAuthResult).toEqual(true);
        expect(authResult).toEqual(true);
        expect(login).toHaveBeenCalledTimes(0);
      });
      test('should try to login again in case of failure to get CDF token with cached account data', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(200, { projects: ['project1', 'project2'] });
        initAuth.mockResolvedValueOnce('wrong-cached–account');
        getCDFToken.mockRejectedValueOnce(
          'wrong account used in attempt to login silently'
        );
        getCDFToken.mockRejectedValueOnce(
          'wrong account used in attempt to get tokes by authenticate method'
        );
        getCDFToken.mockResolvedValueOnce(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        const oAuthResult = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            cluster,
          },
        });
        const authResult = await client.authenticate();

        expect(oAuthResult).toEqual(false);
        expect(authResult).toEqual(true);
        expect(login).toHaveBeenCalledTimes(1);
        expect(getCDFToken).toHaveBeenCalledTimes(3);
      });
      test('should return aad oauth flow type in case of aad flow', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .twice()
          .reply(200, { projects: ['project1', 'project2'] });
        initAuth.mockResolvedValueOnce('account');
        getCDFToken.mockResolvedValue(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: { clientId, cluster },
        });

        const result = await client.authenticate();
        expect(result).toEqual(true);
        expect(client.getOAuthFlowType()).toEqual('AAD_OAUTH');
      });
      test('should throw error on attempt to get Azure AD access token with cognite auth flow', async () => {
        await client.loginWithOAuth({
          type: 'CDF_OAUTH',
          options: { project },
        });
        await expect(
          async () => await client.getAzureADAccessToken()
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Azure AD access token can be acquired only using AzureAD auth flow"`
        );
      });
      test('should throw error on attempt to call setBaseUrl after azure ad auth', async () => {
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(200, { projects: ['project1', 'project2'] });
        getCDFToken.mockResolvedValue('access_token');
        getCluster.mockReturnValueOnce(cluster);

        await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: { clientId, tenantId, cluster },
        });

        const result = await client.authenticate();

        expect(result).toBeTruthy();
        expect(() =>
          client.setBaseUrl('https://someurl.com')
        ).toThrowErrorMatchingInlineSnapshot(
          `"\`setBaseUrl\` does not available with Azure AD auth flow"`
        );
      });
      test('should call onNoProjectAvailable when acquired token is not valid', async () => {
        const onNoProjectAvailable = jest.fn();
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(401, {});
        initAuth.mockResolvedValueOnce('account');
        getCDFToken.mockResolvedValue('access_token');
        getCluster.mockReturnValueOnce(cluster);

        const result = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            tenantId,
            cluster,
            onNoProjectAvailable,
          },
        });

        expect(result).toBe(false);
        expect(onNoProjectAvailable).toHaveBeenCalledTimes(1);
      });
      test('should call onNoProjectAvailable when acquired token during authenticate is not valid', async () => {
        const onNoProjectAvailable = jest.fn();
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(401, {});
        getCluster.mockReturnValueOnce(cluster);
        getCDFToken.mockRejectedValue('failed');
        login.mockResolvedValue(true);
        getCDFToken.mockResolvedValue('access_token');

        const silentLogin = await client.loginWithOAuth({
          type: 'AAD_OAUTH',
          options: {
            clientId,
            tenantId,
            cluster,
            signInType: { type: 'loginPopup' },
            onNoProjectAvailable,
          },
        });

        const authenticated = await client.authenticate();

        expect(silentLogin).toBe(false);
        expect(authenticated).toBe(false);
        expect(onNoProjectAvailable).toHaveBeenCalledTimes(1);
      });
    });

    describe('authentication with adfs', () => {
      let client: BaseCogniteClient;
      const cluster = 'test-cluster';
      const mockClusterUrl = `https://${cluster}.cognitedata.com`;
      const authority = 'https://example.com/adfs/oauth2/authorize';
      const clientId = 'adfsClientId';
      const requestParams = {
        resource: mockClusterUrl,
        clientId,
      };
      const authTokens = {
        idToken: 'idToken',
        accessToken: 'accessToken',
        expiresIn: '3600',
      };

      beforeEach(() => {
        client = new BaseCogniteClient({ appId: 'test-app' });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });

      test('should handle redirect url', async () => {
        const silentADFSLogin = jest
          .spyOn(LoginUtils, 'silentLoginViaIframe')
          .mockRejectedValueOnce('X-Frame-Options header deny');
        window.history.pushState(
          {},
          '',
          `/some/random/path#access_token=${authTokens.accessToken}&id_token=${
            authTokens.idToken
          }&expires_in=${authTokens.expiresIn}&random=123`
        );
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .twice()
          .reply(200, { projects: ['project1', 'project2'] });

        const result = await client.loginWithOAuth({
          type: 'ADFS_OAUTH',
          options: {
            authority,
            requestParams,
          },
        });
        const cdfToken = await client.getCDFToken();

        expect(result).toEqual(true);
        expect(silentADFSLogin).toHaveBeenCalledTimes(1);
        expect(window.location.href).toEqual(
          `https://localhost/some/random/path#random=123`
        );
        expect(cdfToken).toEqual(authTokens.accessToken);
      });
      test('should login silently if possible', async () => {
        const silentADFSLogin = jest
          .spyOn(LoginUtils, 'silentLoginViaIframe')
          .mockRejectedValueOnce('X-Frame-Options header deny')
          .mockResolvedValueOnce(authTokens);
        const spyADFSLoginMethod = jest.spyOn(ADFS.prototype, 'login');
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(200, { projects: ['project1', 'project2'] });

        const result = await client.loginWithOAuth({
          type: 'ADFS_OAUTH',
          options: {
            authority,
            requestParams,
          },
        });

        const authenticated = await client.authenticate();

        expect(result).toEqual(false);
        expect(authenticated).toEqual(true);
        expect(silentADFSLogin).toHaveBeenCalledTimes(2);
        expect(spyADFSLoginMethod).toHaveBeenCalledTimes(0);
      });
      test('should login via redirect when silent login is not possible', async done => {
        const { location } = window;
        // @ts-ignore
        delete window.location;
        window.location = {
          ...location,
          hostname: 'localhost',
          href: 'https://localhost',
        };

        const silentADFSLogin = jest
          .spyOn(LoginUtils, 'silentLoginViaIframe')
          .mockRejectedValue('X-Frame-Options header deny');
        const spyADFSLoginMethod = jest.spyOn(ADFS.prototype, 'login');

        const result = await client.loginWithOAuth({
          type: 'ADFS_OAUTH',
          options: {
            authority,
            requestParams,
          },
        });

        client.authenticate();

        setTimeout(() => {
          expect(result).toEqual(false);
          // 3 attempts to silent login – handling redirect,
          // as part of authenticate and as part of adfsClient.login()
          expect(silentADFSLogin).toHaveBeenCalledTimes(3);
          expect(spyADFSLoginMethod).toHaveBeenCalledTimes(1);
          expect(window.location.href).toMatchInlineSnapshot(
            `"https://example.com/adfs/oauth2/authorize?client_id=${clientId}&scope=user_impersonation IDENTITY&response_mode=fragment&response_type=id_token token&resource=${mockClusterUrl}&redirect_uri=https://localhost"`
          );

          window.location = location;

          done();
        }, 1000);
      });
      test('should call onNoProjectAvailable during loginWithOAuth if needed', async () => {
        const silentADFSLogin = jest
          .spyOn(LoginUtils, 'silentLoginViaIframe')
          .mockResolvedValueOnce(authTokens);
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(401, {});
        const onNoProjectAvailable = jest.fn();

        const result = await client.loginWithOAuth({
          type: 'ADFS_OAUTH',
          options: {
            authority,
            requestParams,
            onNoProjectAvailable,
          },
        });

        expect(result).toEqual(false);
        expect(silentADFSLogin).toHaveBeenCalledTimes(1);
        expect(onNoProjectAvailable).toHaveBeenCalledTimes(1);
      });
      test('should call onNoProjectAvailable during authenticate if needed', async () => {
        const silentADFSLogin = jest
          .spyOn(LoginUtils, 'silentLoginViaIframe')
          .mockRejectedValueOnce('X-Frame-Options header deny')
          .mockResolvedValueOnce(authTokens);
        nock(mockClusterUrl)
          .get('/api/v1/token/inspect')
          .once()
          .reply(401, {});
        const onNoProjectAvailable = jest.fn();

        const result = await client.loginWithOAuth({
          type: 'ADFS_OAUTH',
          options: {
            authority,
            requestParams,
            onNoProjectAvailable,
          },
        });
        const authenticated = await client.authenticate();

        expect(result).toEqual(false);
        expect(authenticated).toEqual(false);
        expect(silentADFSLogin).toHaveBeenCalledTimes(2);
        expect(onNoProjectAvailable).toHaveBeenCalledTimes(1);
      });
    });

    describe('authentication with oidc authorization code', () => {
      // TODO
    });
  });
});
