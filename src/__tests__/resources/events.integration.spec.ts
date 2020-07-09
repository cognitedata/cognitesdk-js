// Copyright 2019 Cognite AS

import CogniteClient from '../../cogniteClient';
import { Asset, CogniteEvent, SortOrder } from '../../types/types';
import { randomInt, setupLoggedInClient } from '../testUtils';

// tslint:disable-next-line:no-big-function
describe('Events integration test', () => {
  let client: CogniteClient;
  let asset: Asset;
  beforeAll(async () => {
    client = setupLoggedInClient();
    [asset] = await client.assets.create([
      { name: 'Test-asset', externalId: `events-test-${randomInt()}` },
    ]);
  });

  afterAll(async () => {
    await client.assets.delete([{ id: asset.id }]);
  });

  const events = [
    {
      description: 'Test event',
      startTime: 10,
      endTime: 100,
    },
    {
      startTime: new Date('1 jan 2016').getTime(),
      source: 'WORKMATE',
      type: 'ACTION',
      subtype: 'POKE',
    },
  ];
  const newDescription = 'New description';
  const newType = 'Potato';
  const newSubType = 'Yukon Gold';

  let createdEvents: CogniteEvent[];

  test('create', async () => {
    createdEvents = await client.events.create(events);
    expect(createdEvents[0].description).toBe(events[0].description);
    expect(createdEvents[1].type).toBe(events[1].type);
    expect(createdEvents[1].subtype).toBe(events[1].subtype);
  });

  test('retrieve', async () => {
    const [singleEvent] = await client.events.retrieve([
      { id: createdEvents[0].id },
    ]);
    expect(singleEvent.description).toBe(events[0].description);
  });

  test('retrieve with non-existent external id', async () => {
    const res = await client.events.retrieve([{ externalId: '_n/a_' }], {
      ignoreUnknownIds: true,
    });
    expect(res.length).toBe(0);
  });

  test('update', async () => {
    const response = await client.events.update([
      {
        id: createdEvents[0].id,
        update: {
          description: { set: newDescription },
        },
      },
    ]);
    expect(response[0].description).toBe(newDescription);
  });

  test('update type and subtype', async () => {
    const response = await client.events.update([
      {
        id: createdEvents[0].id,
        update: {
          type: { set: newType },
          subtype: { set: newSubType },
        },
      },
    ]);
    expect(response[0].type).toBe(newType);
    expect(response[0].subtype).toBe(newSubType);
  });

  test('count aggregate', async () => {
    const aggregates = await client.events.aggregate({
      filter: {
        source: 'WORKMATE',
      },
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
  });

  test('values aggregate', async () => {
    const aggregates = await client.events.uniqueValuesAggregate({
      filter: {
        source: 'WORKMATE',
      },
      fields: ['type'],
    });
    expect(aggregates.length).toBe(1);
    expect(aggregates[0].count).toBeDefined();
    expect(aggregates[0].value).toBeDefined();
  });

  test('delete', async () => {
    await client.events.delete(createdEvents.map(event => ({ id: event.id })));
  });

  test('search', async () => {
    const response = await client.events.search({
      search: {
        description: newDescription,
      },
    });
    expect(response.length).toBeDefined(); // we can't check content because of eventual consistency
  });

  describe('list with sorting', async () => {
    test('ascending', async () => {
      await client.events.list({ sort: { createdTime: 'asc' } });
    });
    test('descending', async () => {
      await client.events.list({ sort: { endTime: SortOrder.DESC } });
    });
    test('multiple props not supported', async () => {
      await expect(
        client.events.list({
          sort: {
            startTime: 'asc',
            lastUpdatedTime: 'desc',
          },
        })
      ).rejects.toThrowError();
    });
  });

  describe('list with filter', () => {
    test('last one', async () => {
      const response = await client.events
        .list({
          filter: {
            startTime: {
              min: events[0].startTime - 1,
              max: events[0].endTime! + 1,
            },
          },
          limit: 3,
        })
        .autoPagingToArray({ limit: 5 });
      expect(response.length).toBeGreaterThan(0);
    });

    test('partitions', async () => {
      const response = await client.events.list({
        partition: '1/10',
        limit: 10,
      });
      expect(response.items.length).toBeGreaterThan(0);
    });

    test('to json|string', async () => {
      const response = await client.events.list({ limit: 2 });
      expect(typeof JSON.stringify(response.items)).toBe('string');
    });

    /**
     * No events attached to the asset, will return zero in each case
     */
    test('rootAssetIds', async () => {
      const { items } = await client.events.list({
        filter: {
          rootAssetIds: [{ id: asset.id }],
        },
        limit: 1,
      });
      expect(items).toEqual([]);
    });

    test('assetSubtreeIds', async () => {
      const { items } = await client.events.list({
        filter: {
          assetSubtreeIds: [{ id: asset.id }],
        },
        limit: 1,
      });
      expect(items).toEqual([]);
    });

    test('externalIdPrefix', async () => {
      const { items } = await client.events.list({
        filter: {
          assetExternalIds: [asset.externalId!],
        },
        limit: 1,
      });
      expect(items).toEqual([]);
    });

    test('ongoing events', async () => {
      const { items } = await client.events.list({
        filter: {
          endTime: { isNull: true },
        },
        limit: 10,
      });

      expect(items.length).toBeGreaterThan(0);
      expect(items[0].endTime).toBeUndefined();
    });

    test('activeAtTime', async () => {
      const { items } = await client.events.list({
        filter: {
          activeAtTime: { min: 101 },
        },
        limit: 10,
      });

      expect(items.length).toBeGreaterThan(0);
    });

    test('dataSetId is null', async () => {
      const { items } = await client.events.list({
        filter: {
          dataSetId: { isNull: true },
        },
        limit: 10,
      });

      expect(items.length).toBeGreaterThan(0);
      expect(items[0].dataSetId).toBeUndefined();
    });
  });

  test('search with rootAssetIds', async () => {
    const response = await client.events.search({
      filter: {
        rootAssetIds: [{ id: asset.id }],
      },
      limit: 1,
    });
    expect(response).toEqual([]);
  });
});
