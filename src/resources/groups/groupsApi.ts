// Copyright 2019 Cognite AS

import { BaseResourceAPI } from '@/resources/baseResourceApi';
import {
  CogniteInternalId,
  Group,
  GroupServiceAccount,
  GroupSpec,
  ItemsResponse,
  ListGroups,
} from '@/types/types';

export class GroupsAPI extends BaseResourceAPI<Group> {
  /**
   * [Create groups](https://doc.cognitedata.com/api/v1/#operation/createGroups)
   *
   * ```js
   * const createdGroups = await client.groups.create([{
   *   name: 'Developers',
   *   capabilities: [{
   *     assetsAcl: {
   *       actions: ['LIST'],
   *       scope: { all: {}}
   *     }
   *   }],
   * }]);
   * ```
   */
  public async create(items: GroupSpec[]): Promise<Group[]> {
    return this.createEndpoint(items);
  }

  /**
   * [List groups](https://doc.cognitedata.com/api/v1/#operation/getGroups)
   *
   * ```js
   * const groups = await client.groups.list({ all: true });
   * ```
   */
  public async list(scope?: ListGroups): Promise<Group[]> {
    const path = this.url();
    const response = await this.httpClient.get<ItemsResponse<Group[]>>(path, {
      params: scope,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  /**
   * [Delete groups](https://doc.cognitedata.com/api/v1/#operation/deleteGroups)
   *
   * ```js
   * await client.groups.delete([921923342342323, 871621872721323]);
   * ```
   */
  public async delete(ids: CogniteInternalId[]): Promise<{}> {
    return super.deleteEndpoint(ids);
  }

  /**
   * [List service accounts in a group](https://doc.cognitedata.com/api/v1/#operation/getMembersOfGroups)
   *
   * ```js
   * const serviceAccounts = await client.groups.listServiceAccounts(921923342342323);
   * ```
   */
  public async listServiceAccounts(
    groupId: CogniteInternalId
  ): Promise<GroupServiceAccount[]> {
    const path = this.encodeServiceAccountUrl(groupId);
    const response = await this.httpClient.get<
      ItemsResponse<GroupServiceAccount[]>
    >(path);
    return this.addToMapAndReturn(response.data.items, response);
  }

  /**
   * [Add service accounts to a group](https://doc.cognitedata.com/api/v1/#operation/addServiceAccountsToGroup)
   *
   * ```js
   * await client.groups.addServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  public async addServiceAccounts(
    groupId: CogniteInternalId,
    serviceAccountIds: CogniteInternalId[]
  ): Promise<{}> {
    const path = this.encodeServiceAccountUrl(groupId);
    const response = await this.httpClient.post<{}>(path, {
      data: { items: serviceAccountIds },
    });
    return this.addToMapAndReturn({}, response);
  }

  /**
   * [Remove service accounts from a group](https://doc.cognitedata.com/api/v1/#operation/removeServiceAccountsFromGroup)
   *
   * ```js
   * await client.groups.removeServiceAccounts(921923342342323, [123312763989213, 23232789217132]);
   * ```
   */
  public async removeServiceAccounts(
    groupId: CogniteInternalId,
    serviceAccountIds: CogniteInternalId[]
  ): Promise<{}> {
    const path = this.encodeServiceAccountUrl(groupId) + '/remove';
    const response = await this.httpClient.post<{}>(path, {
      data: { items: serviceAccountIds },
    });
    return this.addToMapAndReturn({}, response);
  }

  private encodeServiceAccountUrl = (groupId: number) =>
    this.url(`${groupId}/serviceaccounts`);
}
