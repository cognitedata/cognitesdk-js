import { AzureAD } from '../authFlows/aad';

const getAccountByLocalId = jest.fn();
const handleRedirectPromise = jest.fn();
const loginRedirect = jest.fn();
const loginPopup = jest.fn();
const acquireTokenSilent = jest.fn();

jest.mock('@azure/msal-browser', () => {
  return {
    PublicClientApplication: jest.fn().mockImplementation(() => {
      return {
        getAccountByLocalId,
        handleRedirectPromise,
        loginRedirect,
        loginPopup,
        acquireTokenSilent,
      };
    }),
  };
});

const cluster = 'test-cluster';
const config = {
  auth: {
    clientId: '0',
    authority: `0`,
    redirectUri: `${window.location.origin}`,
  },
};
const account = {
  homeAccountId: '1',
  environment: 'environment',
  tenantId: 'your_tenant_id',
  username: 'username',
  localAccountId: 'local_account_id',
};

let azureAdClient: AzureAD;
const originalLocalStorage = localStorage;
const localStorageGetItem = jest.fn();
const localStorageSetItem = jest.fn();

describe('Azure AD auth module', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: localStorageGetItem,
        setItem: localStorageSetItem,
      },
      writable: true,
    });
  });
  beforeEach(() => {
    azureAdClient = new AzureAD({ cluster, config });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
    });
  });
  test('should set cluster from config', () => {
    expect(azureAdClient.getCluster()).toEqual(cluster);
  });

  describe('Get accounts', () => {
    test('should return `null` in case any accounts in localstorage', () => {
      expect(azureAdClient.getAccount()).toEqual(undefined);
      expect(getAccountByLocalId).toHaveBeenCalledTimes(0);
    });
    test('should request for stored local account id', () => {
      const localAccountId = 'some-local-account-id';

      localStorageGetItem.mockReturnValueOnce(localAccountId);
      getAccountByLocalId.mockReturnValueOnce(account);

      expect(azureAdClient.getAccount()).toEqual(account);
      expect(getAccountByLocalId).toHaveBeenCalledWith(localAccountId);
    });
  });
  describe('Init authentication', () => {
    test('should return account info if available', async () => {
      handleRedirectPromise.mockReturnValueOnce({ account });
      const accountInfo = await azureAdClient.initAuth();

      expect(accountInfo).toEqual(account);
    });
    test('should get account from localstorage', async () => {
      const localAccountId = 'some-local-account-id';

      handleRedirectPromise.mockReturnValueOnce(null);
      localStorageGetItem.mockReturnValueOnce(localAccountId);
      getAccountByLocalId.mockReturnValueOnce(account);

      const accountInfo = await azureAdClient.initAuth();

      expect(accountInfo).toEqual(account);
      expect(getAccountByLocalId).toHaveBeenCalledWith(localAccountId);
    });
    test('should return `null` in case if it is impossible to get account data', async () => {
      handleRedirectPromise.mockReturnValueOnce(null);

      const accountInfo = await azureAdClient.initAuth();

      expect(accountInfo).toEqual(undefined);
    });
  });
  describe('Login', () => {
    test('should trigger redirect on login with empty params', async () => {
      await azureAdClient.login();

      expect(loginRedirect).toHaveBeenCalledTimes(1);
    });
    test('should return account in case of success popup login', async () => {
      loginPopup.mockResolvedValueOnce({ account });

      const accountInfo = await azureAdClient.login({ type: 'loginPopup' });

      expect(accountInfo).toEqual(account);
    });
  });
  describe('Get token', () => {
    test('should return `null` if not logged in', async () => {
      const token = await azureAdClient.getCDFToken();

      expect(token).toEqual(null);
    });
    test('should return token if available', async () => {
      loginPopup.mockResolvedValueOnce({ account });
      acquireTokenSilent.mockResolvedValueOnce({ accessToken: 'access_token' });

      localStorageGetItem.mockReturnValueOnce(account.localAccountId);
      getAccountByLocalId.mockReturnValueOnce(account);

      await azureAdClient.login({ type: 'loginPopup' });
      const token = await azureAdClient.getCDFToken();

      expect(token).toEqual('access_token');
    });
    test('should be possible to define request params', async () => {
      const prompt = 'select_account';

      loginPopup.mockResolvedValueOnce({ account });

      await azureAdClient.login({
        type: 'loginPopup',
        requestParams: { prompt },
      });

      expect(loginPopup).toHaveBeenCalledWith({
        prompt,
        scopes: ['User.Read'],
        extraScopesToConsent: [
          `https://${cluster}.cognitedata.com/user_impersonation`,
          `https://${cluster}.cognitedata.com/IDENTITY`,
        ],
      });
    });
    test('should not pass unsupported login request params', async () => {
      loginRedirect.mockResolvedValueOnce(true);
      const prompt = 'select_account';

      await azureAdClient.login({
        type: 'loginRedirect',
        requestParams: {
          // @ts-ignore – check that unsupported params will be filtered
          someRandomParam: 'someRandomValue',
          scope: ['Wrong'],
          prompt,
        },
      });

      expect(loginRedirect).toHaveBeenCalledWith({
        prompt,
        redirectStartPage: 'https://localhost/',
        scopes: ['User.Read'],
        extraScopesToConsent: [
          `https://${cluster}.cognitedata.com/user_impersonation`,
          `https://${cluster}.cognitedata.com/IDENTITY`,
        ],
      });
    });
  });
});
