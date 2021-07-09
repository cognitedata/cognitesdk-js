// Copyright 2020 Cognite AS

import { ExternalTemplateInstance, TemplateInstance } from '../../types';
import CogniteClient from '../../cogniteClient';
import { setupLoggedInClient } from '../testUtils';
import { randomInt } from '@cognite/sdk-core/src/testUtils';

describe('template instances test', () => {
  let client: CogniteClient;

  const externalId = `TemplateInstanceTest ${randomInt()}`;
  const expectedInstances: ExternalTemplateInstance[] = [
    {
      externalId: 'foo',
      templateName: 'Test',
      fieldResolvers: {
        a: 10,
        b: 'test',
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

  it('should create template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.create(expectedInstances);
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should upsert template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.upsert(expectedInstances);
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should list template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.list({
        filter: {
          templateNames: ['Test'],
        },
      })
      .autoPagingToArray({ limit: -1 });
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it('should retrieve template instances', async () => {
    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.retrieve([{ externalId: 'foo' }, { externalId: 'bar' }], {
        ignoreUnknownIds: true,
      });
    expect(result.map(toExternalTemplateInstance)).toEqual(expectedInstances);
  });

  it.skip('should delete template instances', async () => {
    await client.templates
      .group(externalId)
      .version(1)
      .instances.delete([{ externalId: 'foo' }, { externalId: 'bar' }], {
        ignoreUnknownIds: true,
      });

    const result = await client.templates
      .group(externalId)
      .version(1)
      .instances.retrieve([{ externalId: 'foo' }, { externalId: 'bar' }], {
        ignoreUnknownIds: true,
      });
    expect(result.map(toExternalTemplateInstance)).toEqual([]);
  });

  function toExternalTemplateInstance(
    instance: TemplateInstance
  ): ExternalTemplateInstance {
    return {
      externalId: instance.externalId,
      templateName: instance.templateName,
      dataSetId: instance.dataSetId,
      fieldResolvers: instance.fieldResolvers,
    };
  }
});
