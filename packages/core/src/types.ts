// Copyright 2020 Cognite AS

export interface ListResponse<T> extends CursorResponse<T> {
  next?: () => Promise<ListResponse<T>>;
}

export interface CursorResponse<T> extends ItemsWrapper<T> {
  nextCursor?: string;
}

export type ItemsResponse<T> = ItemsWrapper<T[]>;

/** @hidden */
export interface ItemsWrapper<T> {
  items: T;
}

export interface FilterQuery extends Cursor, Limit {}

/**
 * Cursor for paging through results
 */
export interface Cursor {
  cursor?: string;
}

export interface Limit {
  limit?: number;
}

export type IdEither = InternalId | ExternalId;

export interface InternalId {
  id: CogniteInternalId;
}

export interface ExternalId {
  externalId: CogniteExternalId;
}

/**
 * External Id provided by client. Should be unique within the project.
 */
export type CogniteExternalId = string;

export type CogniteInternalId = number;

/**
 * The url to send the user to in order to log out
 * @example https://accounts.google.com/logout
 */
export type LogoutUrl = string;

/**
 * Object containing the log out URL
 */
export interface LogoutUrlResponse {
  data: { url: LogoutUrl };
}

/**
 * A Promise to a response that can be awaited like normal,
 * but at the risk of not getting all results due to API limits.
 * In which case a nextCursor field is returned to request the next page.
 * Helper methods are provided to abstract away the pagination.
 *
 * Example using `client.timeseries.list` with a per-request limit of 1000:
 * ```js
 * const response = client.timeseries.list({ filter: { assetIds: [ASSET_ID] }, limit: 1000 });
 * ```
 *
 * You can get up to 1000 elements with normal await:
 * ```js
 * const { items, nextCursor } = await response;
 * ```
 *
 * You can use `autoPagingToArray` to get more items than the per-request limit.
 * E.g. an array of up to 5000 items:
 * ```js
 * const timeseries = await response.autoPagingToArray({ limit: 5000 });
 * ```
 * You may also specify `{ limit: Infinity }` to get all results.
 *
 * You can also iterate through all items (unless you break out of the loop) like so:
 * ```js
 * for await (const value of response) {
 *   // do something to value
 * }
 * ```
 */
export type CursorAndAsyncIterator<T> = Promise<ListResponse<T[]>> &
  CogniteAsyncIterator<T>;

export interface CogniteAsyncIterator<T> extends AsyncIterableIterator<T> {
  autoPagingEach: AutoPagingEach<T>;
  autoPagingToArray: AutoPagingToArray<T>;
}

export type AutoPagingEachHandler<T> = (
  item: T
) => (void | boolean) | Promise<void | boolean>;

export type AutoPagingEach<T> = (
  handler: AutoPagingEachHandler<T>
) => Promise<void>;

export interface AutoPagingToArrayOptions {
  limit?: number;
}
export type AutoPagingToArray<T> = (
  options?: AutoPagingToArrayOptions
) => Promise<T[]>;

export type OAuthLoginResult = [() => Promise<boolean>, (string | null)];

export interface FlowCallbacks {
  setCluster: (s: string) => void;
  setBearerToken: (s: string) => void;
  validateAccessToken: (s: string) => Promise<boolean>;
}
