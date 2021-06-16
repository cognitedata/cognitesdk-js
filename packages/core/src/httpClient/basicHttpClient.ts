// Copyright 2020 Cognite AS

import fetch, { Response } from 'cross-fetch';
import { stringify } from 'query-string';
import { isJson } from '../utils';
import { HttpError } from './httpError';
import { DEFAULT_DOMAIN } from '../constants';

export class BasicHttpClient {
  private static validateStatusCode(status: number) {
    return status >= 200 && status < 300;
  }
  private static throwCustomErrorResponse<T>(response: HttpResponse<T>) {
    throw new HttpError(response.status, response.data, response.headers);
  }

  private static jsonResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return res.json() as Promise<ResponseType>;
  }

  private static textResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return (res.text() as unknown) as Promise<ResponseType>;
  }

  private static arrayBufferResponseHandler<ResponseType>(
    res: Response
  ): Promise<ResponseType> {
    return (res
      .blob()
      .then(blob => new Response(blob).arrayBuffer()) as unknown) as Promise<
      ResponseType
    >;
  }

  private static getResponseHandler<ResponseType>(
    responseType?: HttpResponseType
  ): ResponseHandler<ResponseType> {
    switch (responseType) {
      case HttpResponseType.ArrayBuffer:
        return BasicHttpClient.arrayBufferResponseHandler;
      case HttpResponseType.Text:
        return BasicHttpClient.textResponseHandler;
      default:
        return BasicHttpClient.jsonResponseHandler;
    }
  }

  private static convertFetchHeaders(fetchHeaders: Headers) {
    const headers: HttpHeaders = {};
    fetchHeaders.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  private static transformRequestBody(data: any) {
    const isJSONStringifyable = isJson(data);
    if (isJSONStringifyable) {
      return JSON.stringify(data, null, 2);
    }
    return data;
  }

  private static resolveUrl(baseUrl: string, path: string) {
    const trimmedBaseUrl = baseUrl.replace(/\/$/, '');
    const pathWithPrefix = (path[0] === '/' ? '' : '/') + path;
    return trimmedBaseUrl + pathWithPrefix;
  }

  private defaultHeaders: HttpHeaders = {};

  /**
   * A basic http client with the option of adding default headers,
   * and the option of using a baseUrl.
   * Note: If the path given starts with `https://`, the baseUrl is ignored.
   *
   * It handles query parameters, and request body data which gets encoded as json if
   * needed.
   *
   * See HttpRequest.
   *
   * @param baseUrl
   */
  constructor(protected baseUrl: string) {}

  public setDefaultHeader(name: string, value: string) {
    this.defaultHeaders[name] = value;
    return this;
  }

  public getDefaultHeaders(): HttpHeaders {
    return { ...this.defaultHeaders };
  }

  public setBaseUrl = (baseUrl: string) => {
    this.baseUrl = baseUrl;
  };

  public getBaseUrl() {
    return this.baseUrl;
  }

  public setCluster = (cluster: string) => {
    this.baseUrl = `https://${cluster}.${DEFAULT_DOMAIN}`;
  };

  public get<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Get,
    });
  }

  // TODO: responseType -> factory pattern
  public post<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Post,
    });
  }

  public put<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Put,
    });
  }

  public delete<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Delete,
    });
  }

  public patch<ResponseType>(path: string, options: HttpRequestOptions = {}) {
    return this.request<ResponseType>({
      ...options,
      path,
      method: HttpMethod.Patch,
    });
  }

  protected async preRequest(request: HttpRequest): Promise<HttpRequest> {
    const populatedHeaders = this.populateDefaultHeaders(request.headers);
    return {
      ...request,
      headers: populatedHeaders,
    };
  }

  protected async postRequest<T>(
    response: HttpResponse<T>,
    _: HttpRequest // eslint-disable-line
  ): Promise<HttpResponse<T>> {
    const requestIsOk = BasicHttpClient.validateStatusCode(response.status);
    if (!requestIsOk) {
      BasicHttpClient.throwCustomErrorResponse(response);
    }
    return response;
  }

  protected populateDefaultHeaders(headers: HttpHeaders = {}) {
    return {
      ...this.defaultHeaders,
      ...headers,
    };
  }

  protected async rawRequest<ResponseType>(
    request: HttpRequest
  ): Promise<HttpResponse<ResponseType>> {
    const url = this.constructUrl(request.path, request.params);
    const headers: HttpHeaders = {
      Accept: 'application/json',
      ...request.headers,
    };
    let body = request.data;
    if (isJson(body)) {
      body = BasicHttpClient.transformRequestBody(body);
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url, {
      body,
      method: request.method,
      headers,
    });
    const responseHandler = BasicHttpClient.getResponseHandler<ResponseType>(
      request.responseType
    );
    const data = await responseHandler(res);
    return {
      headers: BasicHttpClient.convertFetchHeaders(res.headers),
      status: res.status,
      data,
    };
  }

  protected async request<ResponseType>(request: HttpRequest) {
    const mutatedRequest = await this.preRequest(request);
    const rawResponse = await this.rawRequest<ResponseType>(mutatedRequest);
    return this.postRequest(rawResponse, request);
  }

  private constructUrl(path: string, params: HttpQueryParams = {}) {
    let url = path;
    const hasQueryParams = Object.keys(params).length > 0;
    if (hasQueryParams) {
      url += `?${stringify(params)}`;
    }
    const urlContainsHost = url.match(/^https?:\/\//i) !== null;
    if (urlContainsHost) {
      return url;
    }
    return BasicHttpClient.resolveUrl(this.baseUrl, url);
  }
}

export interface HttpRequest extends HttpRequestOptions {
  path: string;
  method: HttpMethod;
}

export interface HttpRequestOptions {
  data?: any;
  params?: HttpQueryParams;
  headers?: HttpHeaders;
  responseType?: HttpResponseType;
  /**
   * Set this to 'true' if you want to send credentials (api-key, access token) with the request to other domains than the specified base url.
   */
  withCredentials?: boolean;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: HttpHeaders;
}

export enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  Patch = 'PATCH',
}

export type HttpResponseType = 'json' | 'arraybuffer' | 'text';

export const HttpResponseType = {
  Json: 'json' as HttpResponseType,
  ArrayBuffer: 'arraybuffer' as HttpResponseType,
  Text: 'text' as HttpResponseType,
};

export interface HttpQueryParams {
  [key: string]: any;
}

export interface HttpHeaders {
  [key: string]: string;
}

type ResponseHandler<ResponseType> = (res: Response) => Promise<ResponseType>;

export type HttpCall = <ResponseType>(
  path: string,
  options?: HttpRequestOptions
) => Promise<HttpResponse<ResponseType>>;
