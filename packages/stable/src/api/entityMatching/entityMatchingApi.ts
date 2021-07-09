// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  IdEither,
} from '@cognite/sdk-core';
import {
  EntityMatchingCreateRequest,
  EntityMatchingCreateResponse,
  EntityMatchingRefitRequest,
  EntityMatchingRefitResponse,
  EntityMatchingChange,
  EntityMatchingPredictRequest,
  EntityMatchingPredictResponse,
  ContextJobId,
  EntityMatchingPredictions,
  EntityMatchingModel,
  EntityMatchingFilterRequest,
} from '../../types';

export class EntityMatchingApi extends BaseResourceAPI<EntityMatchingModel> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      ['createdTime', 'startTime', 'statusTime']
    );
  }

  /**
   * [Create entity matcher](https://docs.cognite.com/api/v1/#operation/entityMatchingCreate)
   *
   * ```js
   * const result = await client.entityMatching.create({
   *  sources: [{externalId: 'asset1', name: 'asset1'}, {externalId: 'asset2', name: 'asset2'}],
   *  targets: [{externalId: 'ts1', name: 'ts1'}, {externalId: 'ts2', name: 'ts2'}],
   *  externalId: 'model123',
   *  name: 'model123',
   * });
   * ```
   */
  public create = async (
    scope: EntityMatchingCreateRequest
  ): Promise<EntityMatchingCreateResponse> => {
    const path = this.url();
    const response = await this.post<EntityMatchingCreateResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve entity matching models](https://docs.cognite.com/api/v1/#operation/entityMatchingRetrieve)
   *
   * ```js
   * const [result] = await client.entityMatching.retrieve([{ externalId: 'model123' }]);
   * ```
   */
  public retrieve = (ids: IdEither[]): Promise<EntityMatchingModel[]> => {
    return super.retrieveEndpoint(ids);
  };

  /**
   * [List entity matching models](https://docs.cognite.com/api/v1/#operation/entityMatchingFilter)
   *
   * ```js
   * const { items } = await client.entityMatching.list({ filter: { name: 'model123' }});
   * ```
   */
  public list = (
    scope?: EntityMatchingFilterRequest
  ): CursorAndAsyncIterator<EntityMatchingModel> => {
    return super.listEndpoint(this.callListEndpointWithPost, scope);
  };

  /**
   * [Update entity matching models](https://docs.cognite.com/api/v1/#operation/entityMatchingUpdate)
   *
   * ```js
   * const [updated] = await client.entityMatching.update([{
   *  externalId: 'model123',
   *  update: { description: { set: 'ø' }}
   * }]);
   * ```
   */
  public update = (
    changes: EntityMatchingChange[]
  ): Promise<EntityMatchingModel[]> => {
    return super.updateEndpoint(changes);
  };

  /**
   * [Delete entity matcher model](https://docs.cognite.com/api/v1/#operation/entityMatchingDelete)
   *
   * ```js
   * await client.entityMatching.delete([{ externalId: 'model123' }]);
   * ```
   */
  public delete = async (ids: IdEither[]): Promise<{}> => {
    return super.deleteEndpoint(ids);
  };

  /**
   * [Predict matches](https://docs.cognite.com/api/v1/#operation/entityMatchingPredict)
   *
   * ```js
   * const response = await client.entityMatching.predict({
   *  externalId: 'model123',
   *  sources: [{externalId: 'asset1', name: 'asset1'}, {externalId: 'asset2', name: 'asset2'}],
   *  targets: [{externalId: 'ts1', name: 'ts1'}, {externalId: 'ts2', name: 'ts2'}],
   * });
   * ```
   */
  public predict = async (
    scope: EntityMatchingPredictRequest
  ): Promise<EntityMatchingPredictResponse> => {
    const path = this.url('predict');
    const response = await this.post<EntityMatchingPredictResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve entity matcher predict result](https://docs.cognite.com/api/v1/#operation/entityMatchingPredictResults)
   *
   * ```js
   * const { status, items } = await client.entityMatching.predictResult(12345678);
   * ```
   */
  public predictResult = async (
    jobId: ContextJobId
  ): Promise<EntityMatchingPredictions> => {
    const path = this.url(`jobs/${jobId}`);
    const response = await this.get<EntityMatchingPredictions>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Re-fit entity matcher model](https://docs.cognite.com/api/v1/#operation/entityMatchingReFit)
   *
   * ```js
   * await client.entityMatching.refit({
   *  newExternalId: 'newModel123',
   *  sources: [{externalId: 'asset1', name: 'asset1'}, {externalId: 'asset2', name: 'asset2'}],
   *  targets: [{externalId: 'ts1', name: 'ts1'}, {externalId: 'ts2', name: 'ts2'}],
   *  externalId: 'model123',
   *  trueMatches: [{sourceExternalId: 'asset1', targetExternalId: 'ts1'}]
   * });
   * ```
   */
  public refit = async (
    scope: EntityMatchingRefitRequest
  ): Promise<EntityMatchingRefitResponse> => {
    const path = this.url('refit');
    const response = await this.post<EntityMatchingRefitResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };
}
