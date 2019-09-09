// Copyright 2019 Cognite AS

import {
  Asset as TypeAsset,
  CogniteClient,
  EventFilter,
  FileFilter,
  TimeseriesFilter,
} from '../../index';
import { AssetList } from './assetList';
import { BaseResource } from './baseResource';

export interface SubtreeOptions {
  depth?: number;
}
export interface DeleteOptions {
  recursive?: boolean;
}
export class Asset extends BaseResource<TypeAsset> implements TypeAsset {
  public get id() {
    return this.props.id;
  }
  public get parentId() {
    return this.props.parentId;
  }
  public get name() {
    return this.props.name;
  }
  public get description() {
    return this.props.description;
  }
  public get metadata() {
    return this.props.metadata;
  }
  public get source() {
    return this.props.source;
  }
  public get lastUpdatedTime() {
    return this.props.lastUpdatedTime;
  }
  public get createdTime() {
    return this.props.createdTime;
  }
  public get rootId() {
    return this.props.rootId;
  }

  constructor(client: CogniteClient, props: TypeAsset) {
    super(client, props);
  }

  /**
   * Deletes the current asset
   *
   * @param {DeleteOptions} options Allow to delete recursively, default ({}) is recursive = false
   * ```js
   * await asset.delete();
   * ```
   */
  public delete = async (options: DeleteOptions = {}) => {
    return this.client.assets.delete(
      [
        {
          id: this.id,
        },
      ],
      options
    );
  };

  /**
   * Retrieves the parent of the current asset
   * ```js
   * const parentAsset = await asset.parent();
   * ```
   */
  public parent = async () => {
    if (this.parentId) {
      const [parentAsset] = await this.client.assets.retrieve([
        { id: this.parentId },
      ]);
      return parentAsset;
    }
    return null;
  };

  /**
   * Returns an AssetList object with all children of the current asset
   * ```js
   * const children = await asset.children();
   * ```
   */
  public children = async () => {
    const childAssets = await this.client.assets
      .list({
        filter: {
          parentIds: [this.id],
        },
      })
      .autoPagingToArray({ limit: Infinity });
    return new AssetList(this.client, childAssets);
  };

  /**
   * Returns the full subtree of the current asset, including the asset itself
   * @param {SubtreeOptions} options Specify the depth of the required subtree, default is the whole asset-hierarchy
   * ```js
   * const subtree = await asset.subtree();
   * ```
   */
  public subtree = async (options?: SubtreeOptions) => {
    const query: SubtreeOptions = options || {};
    return this.client.assets.retrieveSubtree(
      { id: this.id },
      query.depth || Infinity
    );
  };

  /**
   * Returns all timeseries for the current asset
   * @param {TimeseriesFilter} filter Allow specified filter for what timeseries to retrieve
   * ```js
   * const timeSeries = await asset.timeSeries();
   * ```
   */
  public timeSeries = async (filter: TimeseriesFilter = {}) => {
    return this.client.timeseries
      .list({
        ...filter,
        assetIds: [this.id],
      })
      .autoPagingToArray({ limit: Infinity });
  };

  /**
   * Returns all events for the current asset
   * @param {EventFilter} filter Allow specified filter for what events to retrieve
   * ```js
   * const events = await asset.events();
   * ```
   */
  public events = async (filter: EventFilter = {}) => {
    return this.client.events
      .list({
        filter: { ...filter, assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  };

  /**
   * Returns all files for the current asset
   * @param {FileFilter} filter Allow specified filter for what files to retrieve
   * ```js
   * const files = await asset.files();
   * ```
   */
  public files = async (filter: FileFilter = {}) => {
    return this.client.files
      .list({
        filter: { ...filter, assetIds: [this.id] },
      })
      .autoPagingToArray({ limit: Infinity });
  };
}
