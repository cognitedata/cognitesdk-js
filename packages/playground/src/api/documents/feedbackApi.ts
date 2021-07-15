// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  IdEither,
  ItemsWrapper,
} from '@cognite/sdk-core';

import {
  AggregateField,
  DocumentFeedback,
  DocumentFeedbackAggregateRequest,
  DocumentFeedbackAggregateResponse,
  DocumentFeedbackCreateItem,
  FeedbackQueryParameters,
  FeedbackStatus,
} from '../../types';

export class FeedbackAPI extends BaseResourceAPI<DocumentFeedback> {
  public aggregates = (
    fieldName: AggregateField
  ): Promise<DocumentFeedbackAggregateResponse> => {
    const content: DocumentFeedbackAggregateRequest = { field: fieldName };
    return this.aggregateFeedbacks<DocumentFeedbackAggregateResponse>(content);
  };

  public create = (
    feedbacks: DocumentFeedbackCreateItem[]
  ): Promise<DocumentFeedback[]> => {
    return this.createEndpoint<DocumentFeedbackCreateItem>(feedbacks);
  };

  public list = (
    status: FeedbackStatus
  ): CursorAndAsyncIterator<DocumentFeedback> => {
    const parameter: FeedbackQueryParameters = { status: status };
    return this.listEndpoint(this.callListEndpointWithGet, parameter);
  };

  public accept = (ids: IdEither[]) => {
    return this.postAcceptRejectFeedback(ids, 'accept');
  };

  public reject = (ids: IdEither[]) => {
    return this.postAcceptRejectFeedback(ids, 'reject');
  };

  private async postAcceptRejectFeedback(
    ids: IdEither[],
    endpoint: acceptRejectEndpoint
  ) {
    const content: ItemsWrapper<IdEither[]> = { items: ids };
    const path = this.url(endpoint);
    const response = await this.post<ItemsWrapper<(DocumentFeedback)[]>>(path, {
      data: content,
    });
    return this.addToMapAndReturn(response.data.items, response);
  }

  private async aggregateFeedbacks<ResponseType>(
    request: DocumentFeedbackAggregateRequest
  ): Promise<ResponseType> {
    const response = await this.post<ResponseType>(this.url('aggregates'), {
      data: request,
    });
    return response.data;
  }
}

export type acceptRejectEndpoint = 'accept' | 'reject';
