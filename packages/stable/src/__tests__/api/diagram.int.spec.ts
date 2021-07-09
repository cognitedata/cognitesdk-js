// Copyright 2020 Cognite AS

import { runTestWithRetryWhenFailing } from '@cognite/sdk-core/src/testUtils';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('diagram integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  const fileExternalId = 'context-pnid-test-file.pdf';
  const entities = [{ name: 'abc' }];
  let detectJobId: number;
  let convertJobId: number;
  describe('Engineering Diagram', () => {
    test('Detect entities in the diagram', async () => {
      const result = await client.diagram.detect({
        items: [{ fileExternalId: fileExternalId }],
        entities: entities,
      });
      expect(result.status).toBe('Queued');
      detectJobId = result.jobId;
    });

    test('Get result from diagram detect', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const { status } = await client.diagram.detectResult(detectJobId);
        expect(status).toBe('Completed');
      });
      expect.hasAssertions();
    });

    test('Convert a diagram to SVG ', async () => {
      const result = await client.diagram.convert({
        items: [{ fileExternalId: fileExternalId, annotations: [] }],
        grayscale: false,
      });
      expect(result.status).toBe('Queued');
      convertJobId = result.jobId;
    });

    test('Get result from diagram convert', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const { status } = await client.diagram.convertResult(convertJobId);
        expect(status).toBe('Completed');
      });
      expect.hasAssertions();
    });
  });
});
