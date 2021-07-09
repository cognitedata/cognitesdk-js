import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  CursorResponse,
  ExternalId,
} from '@cognite/sdk-core';
import {
  View,
  ExternalView,
  ViewFilterQuery,
  ViewResolveRequest,
} from '../../types';

export class ViewsApi extends BaseResourceAPI<View> {
  public create = (items: ExternalView[]): Promise<View[]> => {
    return this.createEndpoint(items);
  };

  public upsert = (items: ExternalView[]): Promise<View[]> => {
    return this.createEndpoint(items, this.url('upsert'));
  };

  public list = (query?: ViewFilterQuery): CursorAndAsyncIterator<View> => {
    return this.listEndpoint(this.callListEndpointWithPost, query);
  };

  public resolve = <T>(
    resolveRequest: ViewResolveRequest
  ): CursorAndAsyncIterator<T> => {
    const resolveFetch = async (filter?: ViewResolveRequest) => {
      const response = await this.post<CursorResponse<ResponseType[]>>(
        this.url('resolve'),
        {
          data: filter || {},
        }
      );
      return response;
    };
    return (this.listEndpoint(
      resolveFetch as any,
      resolveRequest
    ) as unknown) as CursorAndAsyncIterator<T>;
  };

  public delete = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super.deleteEndpoint(
      ids,
      options || {
        ignoreUnknownIds: false,
      }
    );
  };
}
