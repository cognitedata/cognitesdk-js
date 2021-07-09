// Copyright 2020 Cognite AS

import nock from 'nock';
import { AUTHORIZATION_HEADER } from '../constants';
import { CDFHttpClient } from '../httpClient/cdfHttpClient';
import {
  CogniteAuthentication,
  getIdInfo,
  POPUP,
  REDIRECT,
} from '../authFlows/legacy';
import * as LoginUtils from '../loginUtils';
import { getLogoutUrl, loginWithRedirect } from '../loginUtils';
import * as Utils from '../utils';
import { bearerString } from '../utils';
import {
  authTokens,
  loggedInResponse,
  notLoggedInResponse,
  project,
  projectId,
  mockBaseUrl,
} from '../testUtils';
import { createUniversalRetryValidator } from '../httpClient/retryValidator';

describe('Cognite Auth', () => {
  const response401 = { error: { code: 401, message: '' } };
  const statusPath = '/login/status';
  const logoutPath = '/logout/url';
  const httpClient = new CDFHttpClient(
    mockBaseUrl,
    createUniversalRetryValidator()
  );

  beforeEach(() => {
    window.history.pushState({}, '', '');
    nock.cleanAll();
  });

  describe('Util functions', () => {
    describe('getIdInfo', () => {
      const idInfo = {
        project,
        projectId,
        user: 'user@example.com',
      };
      const successResponse = {
        data: {
          loggedIn: true,
          ...idInfo,
        },
      };

      test('successful getIdInfo', async () => {
        const token = 'abc123';
        nock(mockBaseUrl, {
          reqheaders: {
            [AUTHORIZATION_HEADER]: bearerString(token),
          },
        })
          .get(statusPath)
          .once()
          .reply(200, successResponse);

        await expect(
          getIdInfo(httpClient.get.bind(httpClient), {
            [AUTHORIZATION_HEADER]: bearerString(token),
          })
        ).resolves.toEqual(idInfo);
      });

      test('not authorised (401) getIdInfo', async () => {
        nock(mockBaseUrl)
          .get(statusPath)
          .once()
          .reply(401, response401);
        await expect(
          getIdInfo(httpClient.get.bind(httpClient), {})
        ).resolves.toBeNull();
      });

      test('getIdInfo - not logged in', async () => {
        const token = 'abc123';
        nock(mockBaseUrl)
          .get(statusPath)
          .reply(200, notLoggedInResponse);
        await expect(
          getIdInfo(httpClient.get.bind(httpClient), {
            [AUTHORIZATION_HEADER]: bearerString(token),
          })
        ).resolves.toBeNull();
      });
    });
    describe('getLogoutUrl', () => {
      const url = 'https://example.com/logout';
      const successResponse = { data: { url } };

      test('successful getLogoutUrl', async () => {
        nock(mockBaseUrl)
          .get(logoutPath)
          .once()
          .reply(200, successResponse);

        await expect(
          getLogoutUrl(httpClient.get.bind(httpClient), {})
        ).resolves.toEqual(url);
      });

      test('unauthorised getLogoutUrl', async () => {
        nock(mockBaseUrl)
          .get(logoutPath)
          .once()
          .reply(401, response401);

        await expect(
          getLogoutUrl(httpClient.get.bind(httpClient), {})
        ).resolves.toBeNull();
      });
    });
  });

  describe('Cognite Authentication', () => {
    let authClient: CogniteAuthentication;

    beforeEach(() => {
      authClient = new CogniteAuthentication({ project });
    });

    describe('handle login redirect', () => {
      const isLocalhost = jest
        .spyOn(Utils, 'isLocalhost')
        .mockImplementation(() => true);

      beforeEach(() => {
        window.history.pushState({}, '', '');
        nock.cleanAll();
      });

      afterAll(() => {
        isLocalhost.mockClear();
      });

      test('exception on error query params', async () => {
        window.history.pushState(
          {},
          '',
          `/some/random/path?query=true&error=failed&error_description=message`
        );
        await expect(
          authClient.handleLoginRedirect(httpClient)
        ).rejects.toThrowErrorMatchingInlineSnapshot(`"failed: message"`);
      });

      test('valid tokens in url', async () => {
        window.history.pushState(
          {},
          '',
          `/some/random/path?query=true&access_token=${
            authTokens.accessToken
          }&id_token=${authTokens.idToken}&random=123`
        );
        nock(mockBaseUrl, {
          reqheaders: {
            [AUTHORIZATION_HEADER]: bearerString(authTokens.accessToken),
          },
        })
          .get('/login/status')
          .times(2)
          .reply(200, loggedInResponse);
        const tokens = await authClient.handleLoginRedirect(httpClient);
        expect(tokens).toEqual(authTokens);
        expect(window.location.href).toMatchInlineSnapshot(
          `"https://localhost/some/random/path?query=true&random=123"`
        );
        await expect(authClient.getCDFToken(httpClient)).resolves.toEqual(
          authTokens
        );
      });
    });
    describe('login', () => {
      const { location } = window;

      beforeAll(() => {
        delete window.location;
        window.location = {
          ...location,
          hostname: 'localhost',
          href: 'https://localhost',
          reload: jest.fn(),
        };
      });

      afterAll(() => {
        window.location = location;
      });

      test('login with redirect', () => {
        const onAuthenticate = REDIRECT;
        const baseUrl = httpClient.getBaseUrl();
        const spiedLoginWithRedirect = jest
          .spyOn(LoginUtils, 'loginWithRedirect')
          .mockResolvedValueOnce();

        authClient.login({ onAuthenticate, baseUrl });

        expect(spiedLoginWithRedirect).toHaveBeenCalledTimes(1);
        expect(spiedLoginWithRedirect).toHaveBeenCalledWith({
          baseUrl,
          project,
          redirectUrl: window.location.href,
        });
      });
      test('login with popup', async () => {
        const onAuthenticate = POPUP;
        const baseUrl = httpClient.getBaseUrl();
        const spiedLoginWithPopUp = jest
          .spyOn(LoginUtils, 'loginWithPopup')
          .mockResolvedValueOnce(authTokens);
        const tokens = await authClient.login({ onAuthenticate, baseUrl });

        expect(spiedLoginWithPopUp).toHaveBeenCalledWith({
          baseUrl,
          project,
          redirectUrl: window.location.href,
        });
        expect(tokens).toEqual(authTokens);
      });
      test('login with custom function', async () => {
        const onAuthenticate = jest
          .fn()
          .mockImplementation(({ skip }) => skip());
        const baseUrl = httpClient.getBaseUrl();

        const tokens = await authClient.login({ onAuthenticate, baseUrl });

        expect(onAuthenticate).toHaveBeenCalledTimes(1);
        expect(tokens).toEqual(null);
      });
    });
    describe('loginWithRedirect', () => {
      const { location } = window;

      beforeAll(() => {
        delete window.location;
        window.location = {
          ...location,
          hostname: 'localhost',
          reload: jest.fn(),
        };
      });

      afterAll(() => {
        window.location = location;
      });

      test('redirects', async done => {
        const spiedLocationAssign = jest
          .spyOn(window.location, 'assign')
          .mockImplementation();
        let isPromiseResolved = false;
        loginWithRedirect({
          baseUrl: 'https://example.com',
          project: 'my-tenant',
          redirectUrl: 'https://redirect.com',
          errorRedirectUrl: 'https://error-redirect.com',
        }).then(() => {
          isPromiseResolved = true;
        });
        expect(spiedLocationAssign).toBeCalledTimes(1);
        expect(spiedLocationAssign.mock.calls[0][0]).toMatchInlineSnapshot(
          `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2Ferror-redirect.com&project=my-tenant&redirectUrl=https%3A%2F%2Fredirect.com"`
        );
        setTimeout(() => {
          expect(isPromiseResolved).toBe(false);
          done();
        }, 1000);
      });
    });
  });
});
