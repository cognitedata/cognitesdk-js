// Copyright 2020 Cognite AS

import {
  BaseResourceAPI,
  CursorAndAsyncIterator,
  ExternalId,
} from '@cognite/sdk-core';
import {
  ConstantResolver,
  ExternalTemplateInstance,
  FieldResolver,
  RawResolver,
  SyntheticTimeSeriesResolver,
  TemplateInstance,
  TemplateInstanceFilterQuery,
  ViewResolver,
} from '../../types';
import fromPairs from 'lodash/fromPairs';
import toPairs from 'lodash/toPairs';

export class TemplateInstancesApi extends BaseResourceAPI<TemplateInstance> {
  /**
   * [Create Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstances)
   *
   * ```js
   * const instances = [
   *   { externalId: 'Well_a', templateName: "Well", fieldResolvers: { name: "Underwater P23", pressure: "21_PT19" } },
   *   { externalId: 'Well_b', templateName: "Well", fieldResolvers: { name: "Underwater P01" } },
   * ];
   * const createdInstances = await client.templates.group("myGroup").version(1).create(instances);
   * ```
   */
  public create = (
    items: ExternalTemplateInstance[]
  ): Promise<TemplateInstance[]> => {
    return super
      .createEndpoint(TemplateInstanceCodec.encodeTemplateInstances(items))
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [Upsert Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesUpsert)
   *
   * ```js
   * const instances = [
   *   { externalId: "Well_a", templateName: "Well", fieldResolvers: { name: "Underwater P23", pressure: "21_PT19" } },
   *   { externalId: "Well_b", templateName: "Well", fieldResolvers: { name: "Underwater P01" } },
   * ];
   * const createdInstances = await client.templates.group("myGroup").version(1).upsert(instances);
   * ```
   */
  public upsert = (
    items: ExternalTemplateInstance[]
  ): Promise<TemplateInstance[]> => {
    return super
      .createEndpoint(
        TemplateInstanceCodec.encodeTemplateInstances(items),
        this.url('upsert')
      )
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [Retrieve Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesByids)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).retrieve([ { externalId: 'Well } ]);
   * ```
   */
  public retrieve = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super
      .retrieveEndpoint(ids, options || { ignoreUnknownIds: false })
      .then(TemplateInstanceCodec.decodeTemplateInstances);
  };

  /**
   * [List Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesList)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).list( { templateNames: ["Well"] } );
   * ```
   */
  public list = (
    query?: TemplateInstanceFilterQuery
  ): CursorAndAsyncIterator<TemplateInstance> => {
    return super.listEndpoint(async scope => {
      const res = await this.callListEndpointWithPost(scope);
      return {
        ...res,
        data: {
          ...res.data,
          items: TemplateInstanceCodec.decodeTemplateInstances(res.data.items),
        },
      };
    }, query);
  };

  /**
   * [Delete Template Instances](https://pr-1202.specs.preview.cogniteapp.com/v1.json.html#operation/postApiV1ProjectsProjectTemplategroupsExternalidVersionsVersionInstancesDelete)
   *
   * ```js
   * const instances = await client.templates.group("myGroup").version(1).delete([{ externalId: ["Well_a"] }]);
   * ```
   */
  public delete = (
    ids: ExternalId[],
    options?: { ignoreUnknownIds: boolean }
  ) => {
    return super.deleteEndpoint(
      ids,
      options || {
        ignoreUnknownIds: false,
      }
    );
  };
}

class TemplateInstanceCodec {
  static encodeTemplateInstances(
    templateInstances: ExternalTemplateInstance[]
  ): ExternalTemplateInstance[] {
    return templateInstances.map(item => {
      return {
        ...item,
        fieldResolvers: TemplateInstanceCodec.encodeFieldResolvers(
          item.fieldResolvers
        ),
      };
    });
  }

  static encodeFieldResolvers(
    fieldResolvers: { [K in string]: FieldResolver | {} }
  ): { [K in string]: FieldResolver } {
    const mappedResolvers = toPairs(fieldResolvers).map(
      ([name, fieldResolver]) => {
        if (
          fieldResolver !== undefined &&
          !this.isFieldResolver(fieldResolver)
        ) {
          // Auto-wrap objects, numbers etc. as ConstantResolver.
          return [name, new ConstantResolver(fieldResolver)];
        } else {
          return [name, fieldResolver];
        }
      }
    );

    return fromPairs(mappedResolvers);
  }

  static decodeTemplateInstances(
    templateInstances: TemplateInstance[]
  ): TemplateInstance[] {
    return templateInstances.map(item => {
      return {
        ...item,
        fieldResolvers: TemplateInstanceCodec.decodeFieldResolvers(
          item.fieldResolvers
        ),
      };
    });
  }

  static decodeFieldResolvers(
    fieldResolvers: { [K in string]: FieldResolver | {} }
  ): { [K in string]: FieldResolver | {} } {
    const mappedResolvers = toPairs(fieldResolvers).map(
      ([name, fieldResolver]) => {
        return [
          name,
          TemplateInstanceCodec.decodeFieldResolver(fieldResolver as any),
        ];
      }
    );

    return fromPairs(mappedResolvers);
  }

  static decodeFieldResolver(fieldResolver: any): FieldResolver | {} {
    switch (fieldResolver.type) {
      case 'constant':
        return fieldResolver.value;
      case 'raw':
        return new RawResolver(
          fieldResolver.dbName,
          fieldResolver.tableName,
          fieldResolver.rowKey,
          fieldResolver.columnName
        );
      case 'syntheticTimeSeries':
        return new SyntheticTimeSeriesResolver(
          fieldResolver.expression,
          fieldResolver.name,
          fieldResolver.metadata,
          fieldResolver.description,
          fieldResolver.isStep,
          fieldResolver.isString,
          fieldResolver.unit
        );
      case 'view':
        return new ViewResolver(fieldResolver.externalId, fieldResolver.input);
      default:
        throw new Error('Unknown field resolver type');
    }
  }

  static isFieldResolver(fieldResolver: FieldResolver | {}) {
    return (
      fieldResolver instanceof ConstantResolver ||
      fieldResolver instanceof RawResolver ||
      fieldResolver instanceof SyntheticTimeSeriesResolver ||
      fieldResolver instanceof ViewResolver
    );
  }
}
