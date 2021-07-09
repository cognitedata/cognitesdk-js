import { Client, Issuer, TokenSet } from 'openid-client';
import { FlowCallbacks, OAuthLoginResult } from '../types';

export interface OIDCClientCredentialsFlowOptions {
  clientId: string;
  clientSecret: string;
  scope: string;
  openIdConfigurationUrl: string;
  cluster: string;
  onNoProjectAvailable?: () => void;
}

export class OidcClientCredentials {
  private readonly options: OIDCClientCredentialsFlowOptions;
  private client?: Client;
  private tokens?: TokenSet;
  private readonly callbacks: FlowCallbacks;

  constructor(
    options: OIDCClientCredentialsFlowOptions,
    callbacks: FlowCallbacks
  ) {
    this.options = options;
    this.callbacks = callbacks;
  }

  async init(): Promise<OAuthLoginResult> {
    const issuer = await Issuer.discover(this.options.openIdConfigurationUrl);

    this.client = new issuer.Client({
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
    });

    this.callbacks.setCluster(this.options.cluster);

    const authenticate = async () => {
      const tokens = await this.getAuthTokens();

      if (!(await this.callbacks.validateAccessToken(tokens.access_token!))) {
        if (this.options.onNoProjectAvailable) {
          this.options.onNoProjectAvailable();
        }

        return false;
      }

      this.callbacks.setBearerToken(tokens.access_token!);

      return true;
    };

    return [authenticate, null];
  }

  async getAuthTokens(): Promise<TokenSet> {
    if (!this.client) {
      throw new Error(
        'Need to run OidcVendorGeneric.init before doing anything else'
      );
    }
    this.tokens = await this.client.grant({
      grant_type: 'client_credentials',
      scope: `${this.options.scope} offline_access`,
    });
    return this.tokens;
  }

  getCluster(): string {
    return this.options.cluster;
  }

  getCdfToken(): string | null {
    return (this.tokens && this.tokens.access_token) || null;
  }
}
