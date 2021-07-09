// Copyright 2020 Cognite AS
import { LOCAL_STORAGE_PREFIX } from '../constants';
import {
  PublicClientApplication,
  SilentRequest,
  AuthenticationResult,
  Configuration,
  AccountInfo,
  EndSessionRequest,
  RedirectRequest,
  PopupRequest,
  LogLevel,
  BrowserSystemOptions,
  CacheOptions,
} from '@azure/msal-browser';

export interface AzureADOptions {
  cluster: string;
  config: Configuration;
  debug?: boolean;
}

export interface AzureADSignInType {
  type: AzureADSingInFlow;
  requestParams?: AzureADSignInRequestParams;
}

export interface AzureADSignInRequestParams {
  prompt?: AzureADSignInPrompt;
}

export const AZURE_AUTH_POPUP = 'loginPopup';
export const AZURE_AUTH_REDIRECT = 'loginRedirect';

export type AzureADSingInFlow =
  | typeof AZURE_AUTH_POPUP
  | typeof AZURE_AUTH_REDIRECT;
export type AzureADSignInPrompt =
  | 'login'
  | 'none'
  | 'consent'
  | 'select_account';

const loggerCallback = (level: LogLevel, message: string, containsPi: any) => {
  if (containsPi) {
    return;
  }
  switch (level) {
    case LogLevel.Error:
      console.error(message);
      return;
    case LogLevel.Info:
      console.info(message);
      return;
    case LogLevel.Verbose:
      console.debug(message);
      return;
    case LogLevel.Warning:
      console.warn(message);
  }
};
const accountLocalStorageKey = `${LOCAL_STORAGE_PREFIX}accountLocalId`;

export class AzureAD {
  private msalApplication: PublicClientApplication;
  private userScopes = ['User.Read'];
  private cluster: string = '';

  static getDefaultMSALConfig(
    debug: boolean = false
  ): { cache: CacheOptions; system?: BrowserSystemOptions } {
    return {
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
      system: debug ? { loggerOptions: { loggerCallback } } : undefined,
    };
  }

  constructor({ cluster, config, debug }: AzureADOptions) {
    const msalDefaultConfig = AzureAD.getDefaultMSALConfig(debug);
    this.msalApplication = new PublicClientApplication({
      ...msalDefaultConfig,
      ...config,
    });
    this.cluster = cluster;
  }

  getCluster(): string {
    return this.cluster;
  }

  /**
   * Returns account which has been saved in local storage by localAccountId
   */
  getAccount(): AccountInfo | undefined {
    const localAccountId = this.getLocalAccountIdFromLocalStorage();

    return localAccountId
      ? this.msalApplication.getAccountByLocalId(localAccountId) || undefined
      : undefined;
  }

  /**
   * Checks whether we are in the middle of a redirect and handles state accordingly.
   * Only required for redirect flows.
   *
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
   */
  async initAuth(): Promise<AccountInfo | void> {
    const account = await this.handleAuthRedirect();

    return this.handleAuthAccountResult(account);
  }

  /**
   * Calls loginPopup or loginRedirect based on given signInType.
   * @param signInType
   */
  async login(
    signInType: AzureADSignInType = { type: AZURE_AUTH_REDIRECT }
  ): Promise<AccountInfo | void> {
    const { type, requestParams } = signInType;
    if (type === AZURE_AUTH_POPUP) {
      const { account } = await this.msalApplication.loginPopup(
        this.getLoginPopupRequest(requestParams)
      );

      return this.handleAuthAccountResult(account);
    } else {
      await this.msalApplication.loginRedirect(
        this.getLoginRedirectRequest(requestParams)
      );
    }
  }

  /**
   * Logs out of current account.
   */
  async logout(): Promise<void> {
    const logOutRequest: EndSessionRequest = {
      account: this.getAccount(),
    };

    await this.msalApplication.logout(logOutRequest);

    this.setLocalAccountIdToLocalStorage();
  }

  /**
   * Returns already acquired CDF access token
   */
  async getCDFToken(): Promise<string | null> {
    if (!this.getAccount()) return null;

    const {
      accessToken,
    }: AuthenticationResult = await this.msalApplication.acquireTokenSilent(
      this.silentCDFTokenRequest
    );

    return accessToken;
  }

  /**
   * Returns azure account access token.
   * Can be used for getting user details via Microsoft Graph API
   */
  async getAccountToken(): Promise<string | null> {
    if (!this.getAccount()) return null;

    const {
      accessToken,
    }: AuthenticationResult = await this.msalApplication.acquireTokenSilent(
      this.silentAccountTokenRequest
    );

    return accessToken;
  }

  private getCDFScopes(): string[] {
    return [
      `https://${this.cluster}.cognitedata.com/user_impersonation`,
      `https://${this.cluster}.cognitedata.com/IDENTITY`,
    ];
  }

  private getLoginPopupRequest(
    requestParams: AzureADSignInRequestParams = {}
  ): PopupRequest {
    const { prompt } = requestParams;
    return {
      prompt,
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
    };
  }

  private getLoginRedirectRequest(
    requestParams: AzureADSignInRequestParams = {}
  ): RedirectRequest {
    const { prompt } = requestParams;

    return {
      prompt,
      scopes: this.userScopes,
      extraScopesToConsent: this.getCDFScopes(),
      redirectStartPage: window.location.href,
    };
  }

  private get silentCDFTokenRequest(): SilentRequest {
    return {
      account: this.getAccount(),
      scopes: this.getCDFScopes(),
    };
  }

  private get silentAccountTokenRequest(): SilentRequest {
    return {
      account: this.getAccount(),
      scopes: this.userScopes,
    };
  }

  private handleAuthAccountResult(
    authAccount: AccountInfo | null
  ): AccountInfo | void {
    const account = authAccount || this.getAccount();

    if (account) {
      this.setLocalAccountIdToLocalStorage(account.localAccountId);

      return account;
    }
  }

  private async handleAuthRedirect(): Promise<AccountInfo | null> {
    const redirectResult = await this.msalApplication.handleRedirectPromise();

    return redirectResult && redirectResult.account
      ? redirectResult.account
      : null;
  }

  private setLocalAccountIdToLocalStorage(localId?: string): void {
    if (!localId) {
      localStorage.removeItem(accountLocalStorageKey);
    } else {
      localStorage.setItem(accountLocalStorageKey, localId);
    }
  }

  private getLocalAccountIdFromLocalStorage(): string | null {
    return localStorage.getItem(accountLocalStorageKey);
  }
}
