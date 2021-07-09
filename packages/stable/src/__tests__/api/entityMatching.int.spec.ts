// Copyright 2020 Cognite AS

import {
  randomInt,
  runTestWithRetryWhenFailing,
} from '@cognite/sdk-core/src/testUtils';
import { ExternalEntityToMatch } from '../../types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';

describe('entity matching integration test', () => {
  const assetNameA = `entity_match_test_asset_a ${randomInt()}`;
  const assetNameB = `entity_match_test_asset_b ${randomInt()}`;
  const tsNameA = `TS_${assetNameA}`;
  const tsNameB = `TS_${assetNameB}`;

  let client: CogniteClient;
  let assetA: ExternalEntityToMatch;
  let assetB: ExternalEntityToMatch;
  let tsA: ExternalEntityToMatch;
  let tsB: ExternalEntityToMatch;
  let predictJobId: number;

  beforeAll(async () => {
    client = setupLoggedInClient();
    [assetA, assetB] = [
      { externalId: assetNameA, name: assetNameA },
      { externalId: assetNameB, name: assetNameB },
    ];
    [tsA, tsB] = [
      { externalId: tsNameA, name: tsNameA },
      { externalId: tsNameB, name: tsNameB },
    ];
  });

  describe('Entity Matching', () => {
    const modelExternalId = 'entity_matching_test_fit' + randomInt();
    const newModelExternalId = 'entity_matching_test_refit' + randomInt();
    test('create a model', async () => {
      const result = await client.entityMatching.create({
        name: modelExternalId,
        externalId: modelExternalId,
        sources: [assetA, assetB],
        targets: [tsA, tsB],
      });
      expect(result.externalId).toBe(modelExternalId);
    });

    test('list models', async () => {
      const { items } = await client.entityMatching.list({
        filter: { name: modelExternalId },
      });
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].name).toBe(modelExternalId);
    });

    test('update model', async () => {
      const [item] = await client.entityMatching.update([
        {
          externalId: modelExternalId,
          update: { description: { set: 'ø' } },
        },
      ]);
      expect(item.description).toBe('ø');
    });

    test('retrieve model', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const [result] = await client.entityMatching.retrieve([
          { externalId: modelExternalId },
        ]);
        expect(result.externalId).toBe(modelExternalId);
        expect(result.status).toBe('Completed');
        expect(result.createdTime).toBeInstanceOf(Date);
        expect(result.startTime).toBeInstanceOf(Date);
        expect(result.statusTime).toBeInstanceOf(Date);
      });
      expect.hasAssertions();
    });

    test('predict', async () => {
      const predictResponse = await client.entityMatching.predict({
        externalId: modelExternalId,
        sources: [assetA, assetB],
        targets: [tsA, tsB],
      });
      expect(predictResponse.status).toBe('Queued');
      predictJobId = predictResponse.jobId;
    });

    test('retrieve predict result', async () => {
      await runTestWithRetryWhenFailing(async () => {
        const { status } = await client.entityMatching.predictResult(
          predictJobId
        );
        expect(status).toBe('Completed');
      });
      expect.hasAssertions();
    });

    test('refit model with some true matches', async () => {
      const trueMatches = [
        {
          sourceExternalId: assetA.externalId!,
          targetExternalId: tsA.externalId!,
        },
      ];
      const refitResult = await client.entityMatching.refit({
        trueMatches: trueMatches,
        externalId: modelExternalId,
        newExternalId: newModelExternalId,
        sources: [assetA, assetB],
        targets: [tsA, tsB],
      });
      expect(refitResult.externalId).toBe(newModelExternalId);
      await runTestWithRetryWhenFailing(async () => {
        const [result] = await client.entityMatching.retrieve([
          { id: refitResult.id },
        ]);
        expect(result.externalId).toBe(newModelExternalId);
        expect(result.status).toBe('Completed');
      });
      expect.hasAssertions();
    });

    test('delete model', async () => {
      const result = await client.entityMatching.delete([
        { externalId: modelExternalId },
      ]);
      expect(result).toEqual({});
    });

    afterAll(async () => {
      await client.entityMatching.delete([{ externalId: modelExternalId }]);
    });
  });
});
