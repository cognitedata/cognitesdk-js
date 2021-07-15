// Copyright 2020 Cognite AS

import CogniteClientPlayground from '../../cogniteClientPlayground';
import { setupLoggedInClient } from '../testUtils';

describe('documents api', () => {
  let client: CogniteClientPlayground;

  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('list documents', async () => {
    const response = await client.documents.list();
    expect(response.items.length).toBeGreaterThan(0);
  });
  
  test('list documents, limit to 1', async () => {
    const response = await client.documents.list({ limit: 1 });
    expect(response.items.length).toEqual(1);
  });

  test('list documents, by size', async () => {
    const response = await client.documents.list({
      filter: {
        sourceFile: {
          size: { min: 10, max: 900533317 },
        },
      },
      limit: 1,
    });
    expect(response.items.length).toEqual(1);
  });

  test('list documents feedback', async () => {
    const response = await client.documents.feedback.list('CREATED');
    expect(response.items.length).toBeGreaterThan(0);
  });
});
