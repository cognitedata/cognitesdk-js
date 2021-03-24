// Copyright 2020 Cognite AS

import nock from 'nock';
import BaseCogniteClient, {
  AAD_OAUTH,
  CDF_OAUTH,
  POPUP,
  REDIRECT,
} from '../baseCogniteClient';
import {
  API_KEY_HEADER,
  AUTHORIZATION_HEADER,
  X_CDF_SDK_HEADER,
  BASE_URL,
} from '../constants';
import * as Login from '../login';
import { bearerString, sleepPromise } from '../utils';
import { apiKey, authTokens, project } from '../testUtils';

const initAuth = jest.fn();
const login = jest.fn();
const getCDFToken = jest.fn();
const getCluster = jest.fn();

jest.mock('../aad', () => {
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

const mockBaseUrl = 'https://example.com';
const cdfToken = 'azure-ad-CDF-token';

function setupClient(baseUrl: string = BASE_URL, debug: boolean = false) {
  return new BaseCogniteClient({
    appId: 'JS SDK integration tests',
    baseUrl,
    debug,
  });
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
      expect(
        // @ts-ignore
        () => client.loginWithOAuth()
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithOAuth\` is missing parameter \`options\`"`
      );
    });

    test('missing project name', async () => {
      const client = setupClient();
      expect(
        // @ts-ignore
        () => client.loginWithOAuth({})
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`loginWithOAuth\` is missing correct \`options\` structure"`
      );
    });

    describe('authentication with cognite', () => {
      let mockLoginSilently: jest.SpyInstance;
      let mockRedirect: jest.SpyInstance;
      let mockPopup: jest.SpyInstance;

      beforeEach(() => {
        mockLoginSilently = jest.spyOn(Login, 'loginSilently');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockLoginSilently.mockImplementation(() => {});

        mockRedirect = jest.spyOn(Login, 'loginWithRedirect');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockRedirect.mockImplementation(async () => {});

        mockPopup = jest.spyOn(Login, 'loginWithPopup');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        mockPopup.mockImplementation(async () => {});
      });

      afterEach(() => {
        mockLoginSilently.mockRestore();
        mockRedirect.mockRestore();
      });

      test('default onAuthenticate function should be redirect', async done => {
        const client = setupClient();
        client.loginWithOAuth({ project });
        mockRedirect.mockImplementationOnce(async () => {
          done();
        });
        client.authenticate();
      });

      test('should return cdf oauth flow type in case cdf oauth usage', async () => {
        const client = setupClient();
        client.loginWithOAuth({
          project,
          onAuthenticate: POPUP,
        });
        mockPopup.mockImplementationOnce(async () => {
          return {};
        });
        await client.authenticate();

        expect(client.getOAuthFlowType()).toEqual(CDF_OAUTH);
      });

      test('onAuthenticate: REDIRECT', async done => {
        const client = setupClient();
        client.loginWithOAuth({
          project,
          onAuthenticate: REDIRECT,
        });
        mockRedirect.mockImplementationOnce(async () => {
          done();
        });
        await client.authenticate();
      });

      test('onAuthenticate: POPUP', async done => {
        const client = setupClient();
        client.loginWithOAuth({
          project,
          onAuthenticate: POPUP,
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
        client.loginWithOAuth({
          project,
          onAuthenticate,
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
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('should send one-time header again after silent login', async () => {
        const disposableSdkHeader = 'something';
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({ project, onAuthenticate });
        client.setOneTimeSdkHeader(disposableSdkHeader);
        mockLoginSilently.mockReturnValueOnce(authTokens);
        const reqheaders = { [X_CDF_SDK_HEADER]: disposableSdkHeader };
        const normalReqheaders = { [X_CDF_SDK_HEADER]: /CogniteJavaScriptSDK/ };

        nock(mockBaseUrl, { reqheaders })
          .get('/')
          .once()
          .reply(401, {})
          .get('/')
          .once()
          .reply(200, {});
        nock(mockBaseUrl, { reqheaders: normalReqheaders })
          .get('/')
          .once()
          .reply(200, {});

        await client.get('/');
        await client.get('/');
      });

      test('manually trigger authentication', async () => {
        const onAuthenticate = jest.fn().mockImplementationOnce(login => {
          login.skip();
        });
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        await expect(client.authenticate()).resolves.toBe(false);
        expect(mockLoginSilently).toHaveBeenCalledTimes(1);
      });

      test('handle error query params', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        const errorMessage = 'Failed login';
        mockLoginSilently.mockImplementationOnce(() => {
          throw Error(errorMessage);
        });
        await expect(client.authenticate()).rejects.toThrowError(errorMessage);
      });

      test('retry request after silent login', async () => {
        const onAuthenticate = jest.fn();
        const client = setupClient(mockBaseUrl);
        client.loginWithOAuth({
          project,
          onAuthenticate,
        });
        mockLoginSilently.mockReturnValueOnce(authTokens);
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
      });

      test('dont call onAuthenticate twice when first call hasnt returned yet', async () => {
        const client = setupClient(mockBaseUrl);
        const onAuthenticate = jest.fn().mockImplementationOnce(async login => {
          await sleepPromise(100);
          login.skip();
        });
        client.loginWithOAuth({
          project,
          onAuthenticate,
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
          client.loginWithOAuth({
            project,
            accessToken: authTokens.accessToken,
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
          client.loginWithOAuth({
            project,
            accessToken: authTokens.accessToken,
            onAuthenticate: () => done(),
          });
          nock(mockBaseUrl)
            .get('/')
            .once()
            .reply(401, {});
          client.get('/');
        });
      });
    });

    describe('authentication with azure ad', () => {
      const clientId = 'clientId';
      const tenantId = 'tenantId';
      const cluster = 'test-cluster';
      let client: BaseCogniteClient;

      beforeEach(() => {
        client = new BaseCogniteClient({ appId: 'test-app' });
      });
      afterEach(() => {
        jest.clearAllMocks();
      });

      test('should auth with azure ad', async () => {
        getCDFToken.mockResolvedValueOnce(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        client.loginWithOAuth({ clientId, tenantId, cluster });
        const result = await client.authenticate();

        expect(login).toHaveBeenCalledTimes(1);
        expect(result).toEqual(true);
      });
      test('should auth with azure ad via popup window', async () => {
        getCDFToken.mockResolvedValueOnce(cdfToken);
        getCluster.mockReturnValueOnce(cluster);
        client.loginWithOAuth({
          clientId,
          tenantId,
          cluster,
          signInType: 'loginPopup',
        });

        const result = await client.authenticate();

        expect(login).toHaveBeenCalledWith('loginPopup');
        expect(result).toEqual(true);
      });
      test('should return authenticate false in case missed cdf token', async () => {
        getCDFToken.mockResolvedValueOnce(undefined);
        getCluster.mockReturnValueOnce(cluster);

        client.loginWithOAuth({ clientId, tenantId, cluster });

        const result = await client.authenticate();

        expect(result).toEqual(false);
      });
      test('should return CDF token in case azure ad auth flow', async () => {
        getCDFToken.mockResolvedValue(cdfToken);
        getCluster.mockReturnValueOnce(cluster);

        client.loginWithOAuth({ clientId, tenantId, cluster });

        const result = await client.authenticate();
        const token = await client.getCDFToken();

        expect(result).toEqual(true);
        expect(token).toEqual(cdfToken);
      });
      test('should login silently in case valid account from local storage', async () => {
        initAuth.mockResolvedValueOnce('account');
        getCDFToken.mockResolvedValue(cdfToken);

        client.loginWithOAuth({ clientId, cluster });

        const result = await client.authenticate();

        expect(result).toEqual(true);
        expect(login).toHaveBeenCalledTimes(0);
      });
      test('should try to login again in case of failure to get CDF token with cached account data', async () => {
        initAuth.mockResolvedValueOnce('wrong-cached–account');
        getCDFToken.mockRejectedValueOnce('wrong account used');
        getCDFToken.mockResolvedValueOnce(cdfToken);

        client.loginWithOAuth({ clientId, cluster });

        const result = await client.authenticate();

        expect(result).toEqual(true);
        expect(login).toHaveBeenCalledTimes(1);
        expect(getCDFToken).toHaveBeenCalledTimes(2);
      });
      test('should return aad oauth flow type in case of aad flow', async () => {
        initAuth.mockResolvedValueOnce('account');
        getCDFToken.mockResolvedValue(cdfToken);

        client.loginWithOAuth({ clientId, cluster });

        const result = await client.authenticate();
        expect(result).toEqual(true);
        expect(client.getOAuthFlowType()).toEqual(AAD_OAUTH);
      });
      test('should throw error on attempt to get CDF token with cognite auth flow', async () => {
        const createAuthenticateFunction = jest.spyOn(
          Login,
          'createAuthenticateFunction'
        );
        createAuthenticateFunction.mockReturnValueOnce(() =>
          Promise.resolve(true)
        );
        client.loginWithOAuth({ project });
        await expect(
          async () => await client.getCDFToken()
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"CDF token can be acquired only using AzureAD auth flow"`
        );
      });
      test('should throw error on attempt to get Azure AD access token with cognite auth flow', async () => {
        const createAuthenticateFunction = jest.spyOn(
          Login,
          'createAuthenticateFunction'
        );
        createAuthenticateFunction.mockReturnValueOnce(() =>
          Promise.resolve(true)
        );
        client.loginWithOAuth({ project });
        await expect(
          async () => await client.getAzureADAccessToken()
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          `"Azure AD access token can be acquired only using AzureAD auth flow"`
        );
      });
      test('should throw error on attempt to call setBaseUrl after azure ad auth', async () => {
        getCDFToken.mockResolvedValue('access_token');
        getCluster.mockReturnValueOnce(cluster);

        client.loginWithOAuth({ clientId, tenantId, cluster });

        const result = await client.authenticate();

        expect(result).toBeTruthy();
        expect(() =>
          client.setBaseUrl('https://someurl.com')
        ).toThrowErrorMatchingInlineSnapshot(
          `"\`setBaseUrl\` does not available with Azure AD auth flow"`
        );
      });
    });
  });

  describe('logger', () => {
    const errorMessage = `You can only call authenticate after you have called loginWithOAuth`;
    const loggerFunc = jest.fn();
    const spyOnConsoleLog = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {
        /* ignore console.log */
      });
    let client: BaseCogniteClient;
    beforeEach(() => {
      client = setupClient();
      loggerFunc.mockReset();
      spyOnConsoleLog.mockReset();
    });
    afterAll(() => {
      spyOnConsoleLog.mockRestore();
    });
    test('should be disabled by default', async () => {
      await expect(
        client.authenticate
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"${errorMessage}"`);
      expect(spyOnConsoleLog).toHaveBeenCalledTimes(0);
    });

    test('should call console log if debug option has been set', async () => {
      client = setupClient(BASE_URL, true);

      await expect(
        client.authenticate
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"${errorMessage}"`);
      expect(spyOnConsoleLog).toHaveBeenCalledWith({ message: errorMessage });
    });

    test('should enable logging if custom logger function has been attached', async () => {
      client.attachLogger(loggerFunc);

      await expect(
        client.authenticate
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"${errorMessage}"`);
      expect(spyOnConsoleLog).toHaveBeenCalledTimes(0);
      expect(loggerFunc).toHaveBeenCalledWith({ message: errorMessage });
    });

    test('should detach logger and disable logging', async () => {
      client.attachLogger(loggerFunc);

      await expect(
        client.authenticate
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"${errorMessage}"`);
      expect(loggerFunc).toHaveBeenCalledWith({ message: errorMessage });

      client.detachLogger();

      await expect(
        client.authenticate
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"${errorMessage}"`);
      expect(loggerFunc).toHaveBeenCalledTimes(1);
      expect(spyOnConsoleLog).toHaveBeenCalledTimes(0);
    });
  });
});
