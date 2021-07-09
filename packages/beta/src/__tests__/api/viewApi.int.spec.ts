// Copyright 2020 Cognite AS

import { ExternalView, View } from '../../types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import { randomInt } from '@cognite/sdk-core/src/testUtils';

describe('template view test', () => {
  let client: CogniteClient;

  const externalId = `ViewInstanceTest ${randomInt()}`;
  const expectedViews: ExternalView[] = [
    {
      externalId: 'foo',
      source: {
        type: 'events',
        filter: {
          startTime: {
            min: '$minStartTime',
          },
        },
        mappings: {
          foo: 'description',
        },
      },
    },
  ];

  const templateGroups = [
    {
      externalId,
      description: 'Models a Well system',
      owners: [],
    },
  ];

  const cleanup = async () => {
    await client.templates.groups.delete(templateGroups, {
      ignoreUnknownIds: true,
    });
  };

  beforeAll(async () => {
    client = setupLoggedInClient();
    await cleanup();
    await client.templates.groups.upsert(templateGroups);
    await client.templates.group(externalId).versions.upsert({
      schema: `
      type Test @template {
        a: Int
        b: String
      }
      `,
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it('should create view', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .views.create(expectedViews);
    expect(result.map(toExternalView)).toEqual(expectedViews);
  });

  it('should upsert view', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .views.upsert(expectedViews);
    expect(result.map(toExternalView)).toEqual(expectedViews);
  });

  it('should list view', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .views.list()
      .autoPagingToArray();
    expect(result.map(toExternalView)).toEqual(expectedViews);
  });

  it('should resolve view', async () => {
    await client.templates
      .group(externalId)
      .version(1)
      .views.resolve({
        externalId: expectedViews[0].externalId,
        input: {
          minStartTime: 100,
        },
      });
  });

  it('should delete view', async () => {
    await client.templates
      .group(externalId)
      .version(1)
      .views.delete([
        {
          externalId: expectedViews[0].externalId,
        },
      ]);
  });

  function toExternalView(view: View): ExternalView {
    return {
      externalId: view.externalId,
      source: view.source,
    };
  }
});
