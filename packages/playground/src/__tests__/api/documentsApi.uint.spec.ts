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
});
