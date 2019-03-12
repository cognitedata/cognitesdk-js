// Copyright 2019 Cognite AS

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { authorize, getIdInfoFromApiKey } from '../../resources/login';

describe('Login', () => {
  const baseUrl = 'https://example.com';
  const project = 'my-tenant';
  const user = 'user@example.com';
  const response401 = { error: { code: 401, message: '' } };
  const notLoggedInResponse = {
    data: { loggedIn: false, user: '', project: '' },
  };
  const projectId = 123;
  const loggedInResponse = {
    data: { loggedIn: true, user, project, projectId },
  };
  const statusUrl = `${baseUrl}/login/status`;
  const axiosInstance = axios.create({ baseURL: baseUrl });
  const axiosMock = new MockAdapter(axiosInstance);

  beforeEach(() => {
    axiosMock.reset();
  });

  describe('authorize', () => {
    const authorizeParams = {
      baseUrl,
      project,
      redirectUrl: 'https://redirect.com',
      errorRedirectUrl: 'https://error-redirect.com',
    };
    const authTokens = {
      accessToken: 'abc',
      idToken: 'def',
    };
    const spiedCreateElement = jest.spyOn(document, 'createElement');
    const spiedAppendChild = jest.spyOn(document.body, 'appendChild');
    spiedAppendChild.mockImplementation(iframe => {
      iframe.onload();
    });
    const spiedRemoveChild = jest.spyOn(document.body, 'removeChild');
    beforeEach(() => {
      spiedCreateElement.mockReset();
      spiedRemoveChild.mockReset();
      window.history.pushState({}, '', '');
    });
    afterAll(() => {
      spiedCreateElement.mockRestore();
      spiedAppendChild.mockRestore();
      spiedRemoveChild.mockRestore();
    });

    test('exception on error query params', async () => {
      window.history.pushState(
        {},
        '',
        `/some/random/path?query=true&error=failed&error_description=message`
      );
      await expect(
        authorize(axiosInstance, authorizeParams)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"failed: message"`);
    });

    function createIframe(search: string) {
      return {
        src: '',
        style: {},
        contentWindow: {
          location: {
            search,
          },
        },
      };
    }
    test('silent login', async () => {
      expect.assertions(10);
      const iframe = createIframe(
        `?access_token=${authTokens.accessToken}&id_token=${authTokens.idToken}`
      );
      spiedCreateElement.mockReturnValueOnce(iframe);
      axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(config => {
        expect(config.headers.Authorization).toBe(
          `Bearer: ${authTokens.accessToken}`
        );
        return [200, loggedInResponse];
      });
      const tokens = await authorize(axiosInstance, authorizeParams);
      expect(tokens).toEqual(authTokens);
      expect(spiedCreateElement).toBeCalledTimes(1);
      expect(spiedCreateElement).toBeCalledWith('iframe');
      expect(spiedAppendChild).toBeCalledWith(iframe);
      expect(spiedAppendChild).toBeCalledTimes(1);
      expect(spiedAppendChild).toBeCalledWith(iframe);
      expect(spiedRemoveChild).toBeCalledTimes(1);
      expect(spiedRemoveChild).toBeCalledWith(iframe);
      expect(iframe.src).toMatchInlineSnapshot(
        `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2Ferror-redirect.com&project=my-tenant&redirectUrl=https%3A%2F%2Fredirect.com&prompt=none"`
      );
    });

    test('valid tokens in url', async () => {
      expect.assertions(3);
      window.history.pushState(
        {},
        '',
        `/some/random/path?query=true&access_token=${
          authTokens.accessToken
        }&id_token=${authTokens.idToken}&random=123`
      );
      axiosMock.onGet(`${baseUrl}/login/status`).replyOnce(config => {
        expect(config.headers.Authorization).toBe(
          `Bearer: ${authTokens.accessToken}`
        );
        return [200, loggedInResponse];
      });
      const tokens = await authorize(axiosInstance, authorizeParams);
      expect(tokens).toEqual(authTokens);
      expect(window.location.href).toMatchInlineSnapshot(
        `"https://localhost/some/random/path?query=true&random=123"`
      );
    });

    test('redirect on failed silent login', done => {
      const iframe = createIframe('?error');
      spiedCreateElement.mockReturnValueOnce(iframe);
      let isPromiseResolved = false;
      jest.spyOn(window.location, 'assign').mockImplementationOnce(() => {});
      authorize(axiosInstance, authorizeParams).then(() => {
        isPromiseResolved = true;
      });
      setTimeout(() => {
        expect(isPromiseResolved).toBeFalsy();
        done();
      }, 500);
    });
  });

  describe('getIdInfo', () => {
    const idInfo = {
      project,
      user: 'user@example.com',
    };
    const successResponse = {
      data: {
        loggedIn: true,
        projectId: 1,
        ...idInfo,
      },
    };

    test('successful getIdInfoFromApiKey', async () => {
      const apiKey = 'abc123';
      axiosMock.onGet(statusUrl).replyOnce(config => {
        expect(config.headers['api-key']).toBe(apiKey);
        return [200, successResponse];
      });
      await expect(getIdInfoFromApiKey(axiosInstance, apiKey)).resolves.toEqual(
        idInfo
      );
    });

    test('getIdInfoFromApiKey - 401', async () => {
      const apiKey = 'abc123';
      axiosMock.onGet(statusUrl).replyOnce(401, response401);
      await expect(
        getIdInfoFromApiKey(axiosInstance, apiKey)
      ).resolves.toBeNull();
    });

    test('getIdInfoFromApiKey - not logged in', async () => {
      const apiKey = 'abc123';
      axiosMock.onGet(statusUrl).replyOnce(200, notLoggedInResponse);
      await expect(
        getIdInfoFromApiKey(axiosInstance, apiKey)
      ).resolves.toBeNull();
    });

    // test('successful getIdInfoFromAccessToken', async () => {
    //   const token = 'abc123';
    //   axiosMock.onGet(statusUrl).replyOnce(config => {
    //     expect(config.headers.Authorization).toBe(`Bearer: ${token}`);
    //     return [200, successResponse];
    //   });
    //   await expect(
    //     getIdInfoFromAccessToken(axiosInstance, token)
    //   ).resolves.toEqual(idInfo);
    // });

    // test('getIdInfoFromAccessToken - 401', async () => {
    //   const token = 'abc123';
    //   axiosMock.onGet(statusUrl).replyOnce(401, response401);
    //   await expect(
    //     getIdInfoFromAccessToken(axiosInstance, token)
    //   ).resolves.toBeNull();
    // });

    // test('getIdInfoFromAccessToken - not logged in', async () => {
    //   const token = 'abc123';
    //   axiosMock.onGet(statusUrl).replyOnce(200, notLoggedInResponse);
    //   await expect(
    //     getIdInfoFromAccessToken(axiosInstance, token)
    //   ).resolves.toBeNull();
    // });
  });

  // test('loginWithRedirect', async done => {
  //   const spiedLocationAssign = jest
  //     .spyOn(window.location, 'assign')
  //     .mockImplementation();
  //   let isPromiseResolved = false;
  //   loginWithRedirect({
  //     baseUrl: 'https://example.com',
  //     project: 'my-tenant',
  //     redirectUrl: 'https://redirect.com',
  //     errorRedirectUrl: 'https://error-redirect.com',
  //   }).then(() => {
  //     isPromiseResolved = true;
  //   });
  //   expect(spiedLocationAssign).toBeCalledTimes(1);
  //   expect(spiedLocationAssign.mock.calls[0][0]).toMatchInlineSnapshot(
  //     `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2Ferror-redirect.com&project=my-tenant&redirectUrl=https%3A%2F%2Fredirect.com"`
  //   );
  //   setTimeout(() => {
  //     expect(isPromiseResolved).toBe(false);
  //     done();
  //   }, 1000);
  // });

  // describe('silentLogin', () => {
  //   const project = 'my-tenant';
  //   const baseUrl = 'https://example.com';
  //   const redirectUrl = 'https://redirect.com';
  //   const errorRedirectUrl = 'https://error-redirect.com';
  //   const spiedCreateElement = jest.spyOn(document, 'createElement');
  //   const spiedAppendChild = jest.spyOn(document.body, 'appendChild');
  //   const spiedRemoveChild = jest.spyOn(document.body, 'removeChild');

  //   beforeEach(() => {
  //     spiedCreateElement.mockReset();
  //     spiedAppendChild.mockReset();
  //     spiedRemoveChild.mockReset();
  //   });
  //   afterAll(() => {
  //     spiedCreateElement.mockRestore();
  //     spiedAppendChild.mockRestore();
  //     spiedRemoveChild.mockRestore();
  //   });

  //   async function testSilentLogin(search: string) {
  //     const iframe = {
  //       style: {},
  //       contentWindow: {
  //         location: {
  //           search,
  //         },
  //       },
  //     };
  //     spiedCreateElement.mockReturnValueOnce(iframe);
  //     spiedAppendChild.mockImplementationOnce(frame => {
  //       frame.onload();
  //     });
  //     let result;
  //     let exception;
  //     try {
  //       result = await silentLogin({
  //         baseUrl,
  //         redirectUrl,
  //         errorRedirectUrl,
  //         project,
  //       });
  //     } catch (ex) {
  //       exception = ex;
  //     }
  //     expect(spiedAppendChild).toBeCalledTimes(1);
  //     expect(spiedAppendChild).toBeCalledWith(iframe);
  //     expect(spiedRemoveChild).toBeCalledTimes(1);
  //     expect(spiedRemoveChild).toBeCalledWith(iframe);
  //     if (exception) {
  //       throw exception;
  //     }
  //     return result;
  //   }

  //   test('successful silent login', async () => {
  //     const tokens = {
  //       accessToken: 'abc',
  //       idToken: 'def',
  //     };
  //     const search = `?access_token=${tokens.accessToken}&id_token=${
  //       tokens.idToken
  //     }`;
  //     await expect(testSilentLogin(search)).resolves.toEqual(tokens);
  //   });

  //   test('failing silent login', async () => {
  //     const search = '?error=Failed&error_description=Something';
  //     await expect(testSilentLogin(search)).rejects.toMatchInlineSnapshot(
  //       `[Error: Failed: Something]`
  //     );
  //   });

  //   test('failing silent login - unknown', async () => {
  //     const search = '?';
  //     await expect(testSilentLogin(search)).rejects.toMatchInlineSnapshot(
  //       `[Error: Failed to login]`
  //     );
  //   });
  // });

  // test('clearParametersFromUrl', () => {
  //   window.history.pushState(
  //     {},
  //     '',
  //     `/some/random/path?query=true&access_token=abc&id_token=abc&random=123`
  //   );
  //   clearParametersFromUrl('access_token', 'id_token');
  //   expect(window.location.href).toMatchInlineSnapshot(
  //     `"https://localhost/some/random/path?query=true&random=123"`
  //   );
  // });

  // test('generateLoginUrl', () => {
  //   expect(
  //     generateLoginUrl({
  //       baseUrl: 'https://example.com',
  //       redirectUrl: 'https://redirect.com',
  //       errorRedirectUrl: 'https://errorRedirect.com',
  //       project: 'my-tenant',
  //     })
  //   ).toMatchInlineSnapshot(
  //     `"https://example.com/login/redirect?errorRedirectUrl=https%3A%2F%2FerrorRedirect.com&project=my-tenant&redirectUrl=https%3A%2F%2Fredirect.com"`
  //   );
  // });

  // describe('parseTokenQueryParameters', () => {
  //   test('tokens in url', () => {
  //     expect(
  //       parseTokenQueryParameters('?id_token=abc&access_token=def')
  //     ).toEqual({
  //       idToken: 'abc',
  //       accessToken: 'def',
  //     });
  //   });

  //   test('no tokens', () => {
  //     expect(parseTokenQueryParameters('?another_query_param=def')).toBeNull();
  //   });

  //   test('errors', () => {
  //     expect(() =>
  //       parseTokenQueryParameters('?error=Failed&error_description=abc')
  //     ).toThrowErrorMatchingInlineSnapshot(`"Failed: abc"`);
  //   });
  // });
});
