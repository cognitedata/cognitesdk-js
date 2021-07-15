// Copyright 2020 Cognite AS

import nock from 'nock';
import CogniteClient from '../../cogniteClientPlayground';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '@cognite/sdk-core/src/testUtils';

describe('Documents unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('url', async () => {
    nock(mockBaseUrl + '/api/playground/project/')
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({ search: { query: 'test' } });
  });

  test('search with query', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({ search: { query: 'test' } });
  });

  test('search with filter', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
        filter: {
          type: {
            equals: 'PDF',
          },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: { type: { equals: 'PDF' } },
    });
  });

  test('filter documents', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/list'), {
        filter: {
          author: {
            in: ['test1', 'test2'],
          },
        },
        limit: 5,
      })
      .once()
      .reply(200, {});
    await client.documents.list({
      filter: { author: { in: ['test1', 'test2'] } },
      limit: 5,
    });
  });

  test('filter documents by page count', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/list'), {
        filter: {
          pageCount: {
            min: 3,
            max: 10,
          },
        },
        limit: 5,
      })
      .once()
      .reply(200, {});
    await client.documents.list({
      filter: { pageCount: { min: 3, max: 10 } },
      limit: 5,
    });
  });

  test('search with size range', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/search'), {
        search: {
          query: 'test',
        },
        filter: {
          sourceFile: {
            size: {
              min: 1,
              max: 10,
            },
          },
        },
      })
      .once()
      .reply(200, {});
    await client.documents.search({
      search: { query: 'test' },
      filter: {
        sourceFile: {
          size: { min: 1, max: 10 },
        },
      },
    });
  });
  
  test('create feedback on document', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback'), {
        items: [
          {
            documentId: 1,
            label: { externalId: '2' },
            action: 'ATTACH',
          },
        ],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.create([
      {
        documentId: 1,
        label: { externalId: '2' },
        action: 'ATTACH',
      },
    ]);
  });

  test('list feedback', async () => {
    nock(mockBaseUrl)
      .get(new RegExp('/documents/feedback'))
      .query({ status: 'CREATED' })
      .once()
      .reply(200, {});
    await client.documents.feedback.list('CREATED');
  });

  test('aggregate feedbacks by field', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback/aggregates'), {
        field: 'action',
      })
      .once()
      .reply(200, {});
    await client.documents.feedback.aggregates('action');
  });

  test('accept feedbacks', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback/accept'), {
        items: [{ id: 1 }, { id: 3 }],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.accept([{ id: 1 }, { id: 3 }]);
  });

  test('reject feedbacks', async () => {
    nock(mockBaseUrl)
      .post(new RegExp('/documents/feedback/reject'), {
        items: [{ id: 1 }],
      })
      .once()
      .reply(200, { items: [] });
    await client.documents.feedback.reject([{ id: 1 }]);
  });
});
