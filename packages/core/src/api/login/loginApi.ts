// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '../../baseResourceApi';
import { CDFHttpClient } from '../../httpClient/cdfHttpClient';
import { getIdInfo, IdInfo } from '../../authFlows/legacy';
import { MetadataMap } from '../../metadata';

export class LoginAPI extends BaseResourceAPI<any> {
  /** @hidden */
  constructor(httpClient: CDFHttpClient, map: MetadataMap) {
    super('', httpClient, map);
  }

  /**
   * [Check login status](https://doc.cognitedata.com/api/v1/#operation/status)
   *
   * @deprecated
   *
   * ```js
   * const status = await client.login.status();
   * // if status === null means you are not logged in
   * ```
   */
  public status = (): Promise<null | IdInfo> => {
    return getIdInfo(this.get, {});
  };
}
