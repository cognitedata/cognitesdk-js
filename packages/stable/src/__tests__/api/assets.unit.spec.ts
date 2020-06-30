// Copyright 2020 Cognite AS

import { GraphUtils, promiseAllAtOnce, promiseEachInSequence } from '@cognite/sdk-core';
import * as nock from 'nock';
import { enrichAssetsWithTheirParents } from '../../api/assets/assetUtils';
import CogniteClient from '../../cogniteClient';
import { ExternalAssetItem } from '../../types';
import { setupMockableClient } from '../testUtils';
import { mockBaseUrl } from '../testUtils';

describe('Assets unit test', () => {
  let client: CogniteClient;
  beforeEach(() => {
    client = setupMockableClient();
    nock.cleanAll();
  });

  test('delete with ignoreUnknownIds', async () => {
    const assetIds = [{ id: 123 }];
    nock(mockBaseUrl)
      .post(new RegExp('/assets/delete'), {
        ignoreUnknownIds: true,
        items: [{ id: 123 }],
      })
      .once()
      .reply(200, {});
    await client.assets.delete(assetIds);
  });

  describe('labels', () => {
    const externalAssets = [
      {
        name: 'My pump',
        labels: [{ externalId: 'PUMP' }],
      },
    ];

    test('add label on create', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/assets'), {
          items: externalAssets,
        })
        .once()
        .reply(201, { items: externalAssets });

      const createdAssets = await client.assets.create(externalAssets);
      expect(JSON.parse(JSON.stringify(createdAssets))).toEqual(externalAssets);
    });

    test('filter assets by labels', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/assets/list'), {
          filter: { labels: { containsAny: [{ externalId: 'PUMP' }] } },
        })
        .once()
        .reply(200, { items: externalAssets });

      const fetchedAssets = await client.assets.list({
        filter: {
          labels: {
            containsAny: [{ externalId: 'PUMP' }],
          },
        },
      });
      expect(JSON.parse(JSON.stringify(fetchedAssets.items))).toEqual(
        externalAssets
      );
    });

    test('attach/detach labels to asset', async () => {
      nock(mockBaseUrl)
        .post(new RegExp('/assets/update'), {
          items: [
            {
              id: 123,
              update: {
                labels: {
                  add: [{ externalId: 'PUMP' }],
                  remove: [{ externalId: 'VALVE' }],
                },
              },
            },
          ],
        })
        .once()
        .reply(200, { items: externalAssets });

      const updatedAssets = await client.assets.update([
        {
          id: 123,
          update: {
            labels: {
              add: [{ externalId: 'PUMP' }],
              remove: [{ externalId: 'VALVE' }],
            },
          },
        },
      ]);
      expect(JSON.parse(JSON.stringify(updatedAssets))).toEqual(externalAssets);
    });
  });

  describe('multi promise resolution', () => {
    test('promiseAllAtOnce: fail', async () => {
      const data = ['x', 'a', 'b', 'c'];
      await expect(
        promiseAllAtOnce(
          data,
          input =>
            input === 'x'
              ? Promise.reject(input + 'x')
              : Promise.resolve(input + 'r')
        )
      ).rejects.toEqual({
        failed: ['x'],
        succeded: ['a', 'b', 'c'],
        errors: ['xx'],
        responses: ['ar', 'br', 'cr'],
      });
    });

    test('promiseAllAtOnce: one element', async () => {
      const fail = () =>
        new Promise(() => {
          throw new Error('y');
        });
      await expect(promiseAllAtOnce(['x'], fail)).rejects.toEqual({
        failed: ['x'],
        succeded: [],
        errors: [new Error('y')],
        responses: [],
      });
    });

    test('promiseAllAtOnce: success', async () => {
      const data = ['a', 'b', 'c'];
      await expect(
        promiseAllAtOnce(data, input => Promise.resolve(input))
      ).resolves.toEqual(['a', 'b', 'c']);
    });

    test('promiseEachInSequence', async () => {
      expect(
        await promiseEachInSequence([], input => Promise.resolve(input))
      ).toEqual([]);

      expect(
        await promiseEachInSequence([1], input => Promise.resolve(input))
      ).toEqual([1]);

      expect(
        await promiseEachInSequence([1, 2, 3], input => Promise.resolve(input))
      ).toEqual([1, 2, 3]);

      await expect(
        promiseEachInSequence([1, 2], () => Promise.reject('reject'))
      ).rejects.toEqual({
        failed: [1, 2],
        succeded: [],
        errors: ['reject'],
        responses: [],
      });

      await expect(
        promiseEachInSequence(
          [1, 0, 2, 3],
          input => (input ? Promise.resolve(input) : Promise.reject('x'))
        )
      ).rejects.toEqual({
        failed: [0, 2, 3],
        succeded: [1],
        errors: ['x'],
        responses: [1],
      });

      await expect(
        promiseEachInSequence(
          [1, 2, 0, 3, 0],
          input => (input ? Promise.resolve(input + 'r') : Promise.reject('x'))
        )
      ).rejects.toEqual({
        failed: [0, 3, 0],
        succeded: [1, 2],
        errors: ['x'],
        responses: ['1r', '2r'],
      });
    });
  });

  describe('enrichAssestsWithTheirParents(...)', () => {
    test.each([{ parentId: 123 }, { parentExternalId: 'abc' }, {}])(
      'single asset',
      asset => {
        expect(enrichAssetsWithTheirParents([asset])).toEqual([
          { data: asset },
        ]);
      }
    );

    test('straight tree', () => {
      const rootAsset = {
        externalId: '123',
        parentExternalId: 'abc',
        name: 'root',
      };
      const childAsset = {
        externalId: 'def',
        parentExternalId: rootAsset.externalId,
        name: 'child',
      };
      const grandChildAsset = {
        parentExternalId: childAsset.externalId,
        name: 'grandchild',
      };
      const assets = [childAsset, rootAsset, grandChildAsset];
      const nodes: GraphUtils.Node<ExternalAssetItem>[] = assets.map(asset => ({
        data: asset,
        parentNode: undefined,
      }));
      nodes[0].parentNode = nodes[1];
      nodes[2].parentNode = nodes[0];
      expect(enrichAssetsWithTheirParents(assets)).toEqual(nodes);
    });

    test('regular tree', () => {
      const assetA = { externalId: 'A', name: 'A' };
      const assetAA = {
        externalId: 'AA',
        parentExternalId: assetA.externalId,
        name: 'AA',
      };
      const assetAB = {
        externalId: 'AB',
        parentExternalId: assetA.externalId,
        name: 'AB',
      };
      const assetAAA = {
        externalId: 'AAA',
        parentExternalId: assetAA.externalId,
        name: 'AAA',
      };
      const assetAAB = {
        externalId: 'AAB',
        parentExternalId: assetAA.externalId,
        name: 'AAB',
      };
      const someAsset = {
        parentId: 123,
        name: 'someAsset',
      };
      const assets = [assetAB, assetAAA, someAsset, assetA, assetAAB, assetAA];
      const nodes = enrichAssetsWithTheirParents(assets);

      const dependencies = new Map();
      dependencies.set(assetAA, assetA);
      dependencies.set(assetAB, assetA);
      dependencies.set(assetAAA, assetAA);
      dependencies.set(assetAAB, assetAA);

      const visitedAssets = new Set();

      nodes.forEach(node => {
        const dependency = dependencies.get(node);
        if (dependency) {
          expect(visitedAssets.has(dependency)).toBeTruthy();
        }
        visitedAssets.add(node);
      });
    });
  });

  describe('class is not polluted with enumerable props', async () => {
    const items = [
      {
        id: 1,
      },
      {
        id: 2,
      },
    ];

    beforeEach(() => {
      nock.cleanAll();
      nock(mockBaseUrl)
        .post(new RegExp('/assets/list'))
        .thrice()
        .reply(200, { items });
    });

    test('JSON.stringify works', async () => {
      const assets = await client.assets.list().autoPagingToArray();
      expect(() => JSON.stringify(assets)).not.toThrow();
      expect(() => JSON.stringify(assets[0])).not.toThrow();
    });

    test('change context for asset utility methods', async () => {
      const assets = await client.assets.list().autoPagingToArray();
      const utilMethod = assets[0].children;
      const result = await utilMethod();
      const resultAfterBind = await utilMethod.call(null);
      expect({ ...result[0] }).toEqual({ ...resultAfterBind[0] });
      expect([{ ...result[0] }, { ...result[1] }]).toEqual(items);
    });

    test('spread operator receives only object data props', async () => {
      const assets = await client.assets.list().autoPagingToArray();
      expect([{ ...assets[0] }, { ...assets[1] }]).toEqual(items);
      expect(Object.assign({}, assets[1])).toEqual(items[1]);
    });
  });
});
