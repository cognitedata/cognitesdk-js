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
  test('fetch image preview', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    if (documents.items.length == 0) {
      return;
    }
    const document = documents.items[0];

    await client.documents.preview.documentAsImage(document.id, 0);
  });
  test('fetch pdf preview', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    if (documents.items.length == 0) {
      return;
    }
    const document = documents.items[0];

    const resp = await client.documents.preview.documentAsPdf(document.id);

    expect(resp.byteLength).toBeGreaterThan(5); // %PDF-
    const frontSlice = resp.slice(0, 4);
    expect(frontSlice).toEqual([0x25, 0x50, 0x44, 0x46, 0x2d]);
  });
  test('fetch temporary link', async () => {
    const mediaTypePDF = 'application/pdf';
    const documents = await client.documents.list({
      limit: 1,
      filter: { mimeType: { equals: mediaTypePDF } },
    });
    if (documents.items.length == 0) {
      return;
    }
    const document = documents.items[0];

    const resp = await client.documents.preview.temporaryLink(document.id);
    expect(resp.temporaryLink).toBeDefined();
  });
});
