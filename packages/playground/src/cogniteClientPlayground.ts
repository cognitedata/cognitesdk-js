// Copyright 2020 Cognite AS

import { accessApi, ClientOptions, BaseCogniteClient } from '@cognite/sdk-core';
import { version } from '../package.json';
import { DocumentsAPI } from './api/documents/documentsApi';

export default class CogniteClientPlayground extends BaseCogniteClient {
  private documentsApi?: DocumentsAPI;

  /**
   * Create a new SDK client (playground)
   *
   * The playground client exposes the same configuration as the beta and stable clients.
   * ```js
   * import { CogniteClientPlayground } from '@cognite/sdk-playground';
   *
   * const client = new CogniteClientPlayground({ appId: 'YOUR APPLICATION NAME' });
   *
   * // can also specify a base URL
   * const client = new CogniteClientPlayground({ ..., baseUrl: 'https://greenfield.cognitedata.com' });
   * ```
   *
   * @param options Client options
   */
  constructor(options: ClientOptions) {
    super(options, 'playground');
  }

  public get documents() {
    return accessApi(this.documentsApi);
  }

  protected get version() {
    return `${version}-playground`;
  }

  protected initAPIs() {
    super.initAPIs();

    // Lock version to the following date
    this.httpClient.setDefaultHeader('cdf-version', 'V20210406');
    this.documentsApi = this.apiFactory(DocumentsAPI, 'documents');
  }
  static urlEncodeExternalId(externalId: string): string {
    return encodeURIComponent(externalId);
  }
}
