// Copyright 2020 Cognite AS

import {
  CogniteExternalId,
  CogniteInternalId,
  Cursor,
  ExternalId,
  FilterQuery,
  IdEither,
  InternalId,
  Limit,
} from '@cognite/sdk-core';

export {
  ListResponse,
  CursorResponse,
  ItemsResponse,
  ItemsWrapper,
  FilterQuery,
  Cursor,
  Limit,
  IdEither,
  InternalId,
  ExternalId,
  CogniteExternalId,
  CogniteInternalId,
  LogoutUrl,
  LogoutUrlResponse,
  CursorAndAsyncIterator,
  CogniteAsyncIterator,
  AutoPagingEachHandler,
  AutoPagingEach,
  AutoPagingToArrayOptions,
  AutoPagingToArray,
} from '@cognite/sdk-core';

export interface Acl<ActionsType, ScopeType> {
  actions: ActionsType[];
  scope: ScopeType;
}

export type Acl3D = Acl<AclAction3D, AclScope3D>;

export type AclAction3D = READ | CREATE | UPDATE | DELETE;

export type AclActionAnalytics = READ | EXECUTE | LIST;

export type AclActionApiKeys = LIST | CREATE | DELETE;

export type AclActionAssets = READ | WRITE;

export type AclActionDataSets = READ | WRITE | OWNER;

export type AclActionEvents = READ | WRITE;

export type AclActionFiles = READ | WRITE;

export type AclActionGroups = LIST | READ | CREATE | UPDATE | DELETE;

export type AclActionProjects = LIST | READ | CREATE | UPDATE;

export type AclActionRaw = READ | WRITE | LIST;

export type AclActionSecurityCategories = MEMBEROF | LIST | CREATE | DELETE;

export type AclActionSequences = READ | WRITE;

export type AclActionTimeseries = READ | WRITE;

export type AclActionUsers = LIST | CREATE | DELETE;

export type AclAnalytics = Acl<AclActionAnalytics, AclScopeAnalytics>;

export type AclApiKeys = Acl<AclActionApiKeys, AclScopeApiKeys>;

export type AclAssets = Acl<AclActionAssets, AclScopeAssets>;

export type AclDataSets = Acl<AclActionDataSets, AclScopeDatasets>;

export type AclEvents = Acl<AclActionEvents, AclScopeEvents>;

export type AclFiles = Acl<AclActionFiles, AclScopeFiles>;

export type AclGroups = Acl<AclActionGroups, AclScopeGroups>;

export type AclProjects = Acl<AclActionProjects, AclScopeProjects>;

export type AclRaw = Acl<AclActionRaw, AclScopeRaw>;

export type AclScope3D = AclScopeAll;

export interface AclScopeAll {
  all: {};
}

export interface AclScopeIds {
  idScope: {
    ids: CogniteInternalId[];
  };
}

export type AclScopeAnalytics = AclScopeAll;

export type AclScopeApiKeys = AclScopeAll | AclScopeCurrentUser;

export type AclScopeAssets = AclScopeAll | AclScopeDatasetsIds;

export interface AclScopeAssetsId {
  assetIdScope: {
    subtreeIds: CogniteInternalId[];
  };
}

export interface AclScopeCurrentUser {
  currentuserscope: {};
}

export type AclScopeDatasets = AclScopeAll | AclScopeIds;

export interface AclScopeDatasetsIds {
  datasetScope: {
    ids: CogniteInternalId[];
  };
}

export type AclScopeEvents = AclScopeAll | AclScopeDatasetsIds;

export type AclScopeFiles = AclScopeAll | AclScopeDatasetsIds;

export type AclScopeGroups = AclScopeAll | AclScopeCurrentUser;

export type AclScopeProjects = AclScopeAll;

export type AclScopeRaw = AclScopeAll;

export type AclScopeSecurityCategories = AclScopeAll;

export type AclScopeSequences = AclScopeAll | AclScopeDatasetsIds;

export interface AclScopeTimeSeriesAssetRootIds {
  assetRootIdScope: {
    rootIds: CogniteInternalId[];
  };
}

export type AclScopeTimeseries =
  | AclScopeAll
  | AclScopeAssetsId
  | AclScopeTimeSeriesAssetRootIds
  | AclScopeDatasetsIds;

export type AclScopeUsers = AclScopeAll;

export type AclSecurityCategories = Acl<
  AclActionSecurityCategories,
  AclScopeSecurityCategories
>;

export type AclSequences = Acl<AclActionSequences, AclScopeSequences>;

export type AclTimeseries = Acl<AclActionTimeseries, AclScopeTimeseries>;

export type AclUsers = Acl<AclActionUsers, AclScopeUsers>;

export type Aggregate =
  | 'average'
  | 'max'
  | 'min'
  | 'count'
  | 'sum'
  | 'interpolation'
  | 'stepInterpolation'
  | 'totalVariation'
  | 'continuousVariance'
  | 'discreteVariance';

export interface ApiKeyListScope {
  /**
   * Only available with users:list acl, returns all api keys for this project.
   */
  all?: boolean;
  /**
   * Get api keys for a specific service account, only available to admin users.
   */
  serviceAccountId?: CogniteInternalId;
  /**
   * Whether to include deleted api keys
   */
  includeDeleted?: boolean;
}

export interface ApiKeyObject {
  /**
   * Internal id for the api key
   */
  id: CogniteInternalId;
  /**
   * Id of the service account
   */
  serviceAccountId: CogniteInternalId;
  createdTime: Date;
  /**
   * The status of the api key
   */
  status: 'ACTIVE' | 'DELETED';
}

export interface ApiKeyRequest {
  serviceAccountId: CogniteInternalId;
}

export type ArrayPatchString =
  | { set: string[] }
  | { add?: string[]; remove?: string[] };

export type ArrayPatchLong =
  | { set: number[] }
  | { add?: number[]; remove?: number[] };

export type ArrayPatchClaimNames =
  | { set: ClaimName[] }
  | { add?: ClaimName[]; remove?: ClaimName[] };

export interface Asset
  extends ExternalAsset,
    AssetInternalId,
    CreatedAndLastUpdatedTime {
  /**
   * The id of the root for the tree this asset belongs to
   */
  rootId: CogniteInternalId;
  /**
   * Aggregated metrics of the asset
   */
  aggregates?: AssetAggregateResult;
  /**
   * The parent's externalId if defined
   */
  parentExternalId?: CogniteExternalId;
}

export interface AggregateResponse {
  /**
   * Size of the aggregation group
   */
  count: number;
}

export interface UniqueValuesAggregateResponse extends AggregateResponse {
  /**
   * A unique value from the requested field
   */
  value: string | number;
}

/**
 * Response from asset aggregate endpoint
 */
export type AssetAggregate = AggregateResponse;

/**
 * Response from event aggregate endpoint
 */
export type EventAggregate = AggregateResponse;

/**
 * Response from file aggregate endpoint
 */
export type FileAggregate = AggregateResponse;

/**
 * Response from sequence aggregate endpoint
 */
export type SequenceAggregate = AggregateResponse;

/**
 * Response from timeseries aggregate endpoint
 */
export type TimeseriesAggregate = AggregateResponse;

/**
 * Query schema for asset aggregate endpoint
 */
export interface AssetAggregateQuery {
  /**
   * Filter on assets with strict matching.
   */
  filter?: AssetFilterProps;
}

/**
 * Query schema for files aggregate endpoint
 */
export interface FileAggregateQuery {
  /**
   * Filter on files with strict matching.
   */
  filter?: FileFilterProps;
}

/**
 * Query schema for timeseries aggregate endpoint
 */
export interface TimeseriesAggregateQuery {
  /**
   * Filter on timeseries with strict matching.
   */
  filter?: TimeseriesFilter;
}

export interface AssetAggregateResult {
  /**
   * Number of direct descendants for the asset
   */
  childCount?: number;
  /**
   * Asset path depth (number of levels below root node).
   */
  depth?: number;
  /**
   * IDs of assets on the path to the asset.
   */
  path?: AssetIdEither[];
}

export type AssetAggregatedProperty = 'childCount' | 'path' | 'depth';

export type AssetChange = AssetChangeById | AssetChangeByExternalId;

export interface AssetChangeByExternalId extends AssetPatch, ExternalId {}

export interface AssetChangeById extends AssetPatch, InternalId {}

/**
 * Description of asset.
 */
export type AssetDescription = string;

export type AssetExternalId = ExternalId;

/**
 * Filter on assets with exact match
 */
export interface AssetFilter extends Limit {
  filter?: AssetFilterProps;
}

export interface AssetFilterProps {
  name?: AssetName;
  /**
   * Return only the direct descendants of the specified assets.
   */
  parentIds?: CogniteInternalId[];
  /**
   * Return only the direct descendants of the specified assets.
   */
  parentExternalIds?: CogniteExternalId[];
  rootIds?: IdEither[];
  /**
   * Only include assets that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  /**
   * Only include assets in subtrees rooted at the specified assets.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  /**
   * Return only the assets matching the specified label constraints.
   */
  labels?: LabelFilter;
  metadata?: Metadata;
  source?: AssetSource;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  /**
   * Filtered assets are root assets or not
   */
  root?: boolean;
  externalIdPrefix?: ExternalIdPrefix;
}

export type AssetIdEither = IdEither;

export type AssetInternalId = InternalId;

export interface AssetListScope extends AssetFilter, FilterQuery {
  /**
   * Set of aggregated properties to include
   */
  aggregatedProperties?: AssetAggregatedProperty[];
  partition?: Partition;
}

export interface AssetMapping3D extends AssetMapping3DBase {
  /**
   * A number describing the position of this node in the 3D hierarchy, starting from 0.
   * The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The number of nodes in the subtree of this node (this number included the node itself).
   */
  subtreeSize: number;
}

export interface AssetMapping3DBase {
  /**
   * The ID of the node.
   */
  nodeId: CogniteInternalId;
  /**
   * The ID of the associated asset (Cognite's Assets API).
   */
  assetId: CogniteInternalId;
}

export interface AssetMappings3DListFilter extends FilterQuery {
  nodeId?: CogniteInternalId;
  assetId?: CogniteInternalId;
  /**
   * If given, only return asset mappings for assets whose bounding box intersects the given bounding box.
   */
  intersectsBoundingBox?: BoundingBox3D;
}

export interface AssetMappings3DAssetFilter {
  assetIds: CogniteInternalId[];
}

export interface AssetMappings3DNodeFilter {
  nodeIds: CogniteInternalId[];
}

export interface AssetMappings3DTreeIndexFilter {
  treeIndexes: CogniteInternalId[];
}

export interface Filter3DAssetMappingsQuery extends FilterQuery {
  /**
   * A filter for either `assetIds`, `nodeIds` or `treeIndices`.
   */
  filter?:
    | AssetMappings3DAssetFilter
    | AssetMappings3DNodeFilter
    | AssetMappings3DTreeIndexFilter;
}

/**
 * Name of asset. Often referred to as tag.
 */
export type AssetName = string;

export interface AssetPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchRequiredString;
    description?: SinglePatchString;
    dataSetId?: NullableSinglePatchLong;
    metadata?: ObjectPatch;
    labels?: LabelsPatch;
    source?: SinglePatchString;
  };
}

export interface AssetRetrieveParams extends IgnoreUnknownIds {
  /**
   * Set of aggregated properties to include
   */
  aggregatedProperties?: AssetAggregatedProperty[];
}

export interface AssetSearchFilter extends AssetFilter {
  search?: {
    name?: AssetName;
    query?: AssetName | AssetDescription;
    description?: AssetDescription;
  };
}

/**
 * The source of this asset
 */
export type AssetSource = string;

/**
 * Data specific to Azure AD authentication
 */
export interface AzureADConfiguration {
  /**
   * Azure application ID. You get this when creating the Azure app.
   */
  appId?: string;
  /**
   * Azure application secret. You get this when creating the Azure app.
   */
  appSecret?: string;
  /**
   * Azure tenant ID.
   */
  tenantId?: string;
  /**
   * Resource to grant access to. This is usually (always?) 00000002-0000-0000-c000-000000000000
   */
  appResourceId?: string;
}

/**
 * The bounding box of the subtree with this sector as the root sector.
 * Is null if there are no geometries in the subtree.
 */
export interface BoundingBox3D {
  /**
   * The minimal coordinates of the bounding box.
   */
  min: Tuple3<number>;
  /**
   * The maximal coordinates of the bounding box.
   */
  max: Tuple3<number>;
}

export type CREATE = 'CREATE';

export type CogniteCapability = SingleCogniteCapability[];

export interface CogniteEvent
  extends ExternalEvent,
    InternalId,
    CreatedAndLastUpdatedTime {}

export type CreateAssetMapping3D = AssetMapping3DBase;

export interface CreateModel3D {
  /**
   * The name of the model.
   */
  name: string;
  metadata?: Metadata;
}

export interface CreateRevision3D {
  /**
   * True if the revision is marked as published.
   */
  published?: boolean;
  /**
   * Global rotation to be applied to the entire model.
   * The rotation is expressed by Euler angles in radians and in XYZ order.
   */
  rotation?: Tuple3<number>;
  camera?: RevisionCameraProperties;
  /**
   * The file id to a file uploaded to Cognite's Files API.
   * Can only be set on revision creation, and can never be updated. _Only FBX files are supported_.
   */
  fileId: CogniteInternalId;
  metadata?: Metadata;
}

export interface CreatedAndLastUpdatedTime {
  lastUpdatedTime: Date;
  createdTime: Date;
}

export interface CreatedAndLastUpdatedTimeFilter {
  lastUpdatedTime?: DateRange;
  createdTime?: DateRange;
}

export type DELETE = 'DELETE';

export interface DataIds {
  items?: AssetIdEither[];
}

export interface DataSet
  extends ExternalDataSet,
    InternalId,
    CreatedAndLastUpdatedTime {
  writeProtected: DataSetWriteProtected;
}

/**
 * Response from dataset aggregate endpoint
 */
export interface DataSetAggregate {
  /**
   * Size of the aggregation group
   */
  count: number;
}

/**
 * Query schema for datasets aggregate endpoint
 */
export interface DataSetAggregateQuery {
  /**
   * Filter on datasets with strict matching.
   */
  filter?: DataSetFilter;
}

export type DataSetChange = DataSetChangeById | DataSetChangeByExternalId;

export interface DataSetChangeByExternalId extends DataSetPatch, ExternalId {}

export interface DataSetChangeById extends DataSetPatch, InternalId {}

export type Label = ExternalId;

export type LabelFilter = LabelContainsAnyFilter | LabelContainsAllFilter;

export interface LabelContainsAnyFilter {
  containsAny: Label[];
}

export interface LabelContainsAllFilter {
  containsAll: Label[];
}

export interface LabelsPatch {
  /**
   * A list of labels to add to the resource
   */
  add?: Label[];
  /**
   * A list of labels to remove to the resource
   */
  remove?: Label[];
}

export interface ExternalLabelDefinition extends Label {
  /**
   * Name of the label.
   */
  name: string;

  /**
   * Description of the label.
   */
  description?: string;
}

export interface LabelDefinition extends ExternalLabelDefinition {
  createdTime: Date;
}

export interface LabelDefinitionFilter {
  /**
   * Returns the label definitions matching that name.
   */
  name?: string;

  /**
   * Filter external ids starting with the prefix specified
   */
  externalIdPrefix?: ExternalIdPrefix;
}

export interface LabelDefinitionFilterRequest extends FilterQuery {
  filter?: LabelDefinitionFilter;
}

/**
 * Filter on data sets with exact match
 */
export interface DataSetFilter extends CreatedAndLastUpdatedTimeFilter {
  metadata?: Metadata;
  externalIdPrefix?: ExternalIdPrefix;
  writeProtected?: DataSetWriteProtected;
}

export interface DataSetFilterRequest extends FilterQuery {
  filter?: DataSetFilter;
}

export interface DataSetPatch {
  update: {
    externalId?: SinglePatchString;
    name?: SinglePatchString;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    writeProtected?: SetField<boolean>;
  };
}

/**
 * Write-protected data sets impose additional restrictions on write access to resources inside a data set which can help ensuring data integrity of the data set.
 * For write-protected data set in addition to a writing capability that has given resource data in scope, principal must be an owners of the data set.
 * Note that this does not affect any security categories set for given resource data, both security category membership and data set ownership is required in such case
 */
export type DataSetWriteProtected = boolean;

export interface DatapointsDeleteRange {
  /**
   * The timestamp of first datapoint to delete
   */
  inclusiveBegin: Timestamp;
  /**
   * If set, the timestamp of first datapoint after inclusiveBegin to not delete. If not set, only deletes the datapoint at inclusiveBegin.
   */
  exclusiveEnd?: Timestamp;
}

export type DatapointsDeleteRequest =
  | (InternalId & DatapointsDeleteRange)
  | (ExternalId & DatapointsDeleteRange);

export interface DatapointAggregates extends DatapointsMetadata {
  isString: false;
  /**
   * Whether the timeseries is a step series or not
   */
  isStep: boolean;
  datapoints: DatapointAggregate[];
}

export type Datapoints = StringDatapoints | DoubleDatapoints;

export interface DoubleDatapoints extends DatapointsMetadata {
  isString: false;
  /**
   * Whether the timeseries is a step series or not
   */
  isStep?: boolean;
  /**
   * The list of datapoints
   */
  datapoints: DoubleDatapoint[];
}

export interface StringDatapoints extends DatapointsMetadata {
  isString: true;
  /**
   * The list of datapoints
   */
  datapoints: StringDatapoint[];
}

export interface ExternalDatapoints {
  datapoints: ExternalDatapoint[];
}

export interface DatapointsMetadata extends InternalId {
  /**
   * External id of the timeseries the datapoints belong to.
   */
  externalId?: CogniteExternalId;
  /**
   * Whether or not the datapoints are string values.
   */
  isString: boolean;
  /**
   * Name of the physical unit of the time series
   */
  unit?: string;
}

export interface DatapointsMultiQuery extends DatapointsMultiQueryBase {
  items: DatapointsQuery[];
}

export interface DatapointsMultiQueryBase extends Limit, IgnoreUnknownIds {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send in a Date object. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string | Timestamp;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string | Timestamp;
  /**
   * The aggregates to be returned. This value overrides top-level default aggregates list when set. Specify all aggregates to be retrieved here. Specify empty array if this sub-query needs to return datapoints without aggregation.
   */
  aggregates?: Aggregate[];
  /**
   * The time granularity size and unit to aggregate over.
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
}

export type ExternalDatapointsQuery =
  | ExternalDatapointId
  | ExternalDatapointExternalId;

export interface ExternalDatapointExternalId
  extends ExternalDatapoints,
    ExternalId {}

export interface ExternalDatapointId extends ExternalDatapoints, InternalId {}

export type DatapointsQuery = DatapointsQueryId | DatapointsQueryExternalId;

export interface DatapointsQueryExternalId
  extends DatapointsQueryProperties,
    ExternalId {}

export interface DatapointsQueryId
  extends DatapointsQueryProperties,
    InternalId {}

export interface DatapointsQueryProperties extends Limit {
  /**
   * Get datapoints after this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send in Date object. Note that when using aggregates, the start time will be rounded down to a whole granularity unit (in UTC timezone). For granularity 2d it will be rounded to 0:00 AM on the same day, for 3h it will be rounded to the start of the hour, etc.
   */
  start?: string | Timestamp;
  /**
   * Get datapoints up to this time. Same format as for start. Note that when using aggregates, the end will be rounded up such that the last aggregate represents a full aggregation interval containing the original end, where the interval is the granularity unit times the granularity multiplier. For granularity 2d, the aggregation interval is 2 days, if end was originally 3 days after the start, it will be rounded to 4 days after the start.
   */
  end?: string | Timestamp;
  /**
   * The aggregates to be returned.  Use default if null. An empty string must be sent to get raw data if the default is a set of aggregates.
   */
  aggregates?: Aggregate[];
  /**
   * The granularity size and granularity of the aggregates (2h)
   */
  granularity?: string;
  /**
   * Whether to include the last datapoint before the requested time period,and the first one after the requested period. This can be useful for interpolating data. Not available for aggregates.
   */
  includeOutsidePoints?: boolean;
}

export type DateRange = Range<Timestamp>;

/**
 * A default group for all project users. Can be used to establish default capabilities. WARNING: this group may be logically deleted
 */
export type DefaultGroupId = number;

export type DeleteAssetMapping3D = AssetMapping3DBase;

export type EXECUTE = 'EXECUTE';

/**
 * Query schema for event aggregate endpoint
 */
export interface EventAggregateQuery {
  /**
   * Filter on events with strict matching.
   */
  filter?: EventFilter;
}

export interface EventUniqueValuesAggregate extends EventAggregateQuery {
  /**
   * The field name(s) to apply the aggregation on. Currently limited to one field.
   */
  fields: ('type' | 'subtype' | 'dataSetId')[];
}

export type EventChange = EventChangeById | EventChangeByExternalId;

export interface EventChangeByExternalId extends EventPatch, ExternalId {}

export interface EventChangeById extends EventPatch, InternalId {}

export interface EventFilter extends CreatedAndLastUpdatedTimeFilter {
  startTime?: DateRange;
  /**
   * Date range for event end time.
   * To filter ongoing events {isNull: true} should be provided instead of Date range
   */
  endTime?: NullableProperty<DateRange>;
  /**
   * Event is considered active from its startTime to endTime inclusive. If startTime is null, event is never active. If endTime is null, event is active from startTime onwards. activeAtTime filter will match all events that are active at some point from min to max, from min, or to max, depending on which of min and max parameters are specified.
   */
  activeAtTime?: DateRange;

  metadata?: Metadata;
  /**
   * Asset IDs of related equipment that this event relates to.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Asset External IDs of related equipment that this event relates to.
   */
  assetExternalIds?: CogniteExternalId[];
  /**
   * Only include events that have a related asset in a tree rooted at any of these root assetIds.
   */
  rootAssetIds?: IdEither[];
  /**
   * Only include events that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  /**
   * Only include events that have a related asset in a subtree rooted at any of these assetIds.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  /**
   * Filter by event source
   */
  source?: string;
  /**
   * Filter by event type
   */
  type?: string;
  /**
   * Filter by event subtype
   */
  subtype?: string;
  externalIdPrefix?: ExternalIdPrefix;
}

export interface EventFilterRequest extends FilterQuery {
  filter?: EventFilter;
  sort?: EventSort;
  partition?: Partition;
}

export interface EventPatch {
  update: {
    externalId?: SinglePatchString;
    startTime?: SinglePatchDate;
    endTime?: SinglePatchDate;
    description?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    dataSetId?: NullableSinglePatchLong;
    source?: SinglePatchString;
    type?: SinglePatchString;
    subtype?: SinglePatchString;
  };
}

export interface EventSearch {
  description?: string;
}

export interface EventSearchRequest extends Limit {
  filter?: EventFilter;
  search?: EventSearch;
}

/**
 * Sort by selected fields.
 * Only sorting on 1 field is currently supported.
 * Partitions are done independently of sorting, there is no guarantee on sort order between elements from different partitions.
 */
export interface EventSort {
  startTime?: SortOrder;
  endTime?: SortOrder;
  createdTime?: SortOrder;
  lastUpdatedTime?: SortOrder;
}

export interface ExternalAsset {
  externalId?: CogniteExternalId;
  name: AssetName;
  parentId?: CogniteInternalId;
  description?: AssetDescription;
  dataSetId?: CogniteInternalId;
  metadata?: Metadata;
  source?: AssetSource;
  labels?: Label[];
}

export interface ExternalAssetItem extends ExternalAsset {
  /**
   * External id to the parent asset
   */
  parentExternalId?: CogniteExternalId;
}

export interface ExternalDataSet {
  externalId?: CogniteExternalId;
  /**
   * Name of data set
   */
  name?: string;
  /**
   * Description of data set
   */
  description?: string;
  metadata?: Metadata;
  writeProtected?: DataSetWriteProtected;
}

/**
 * An event represents something that happened at a given interval in time, e.g a failure, a work order etc.
 */
export interface ExternalEvent {
  externalId?: CogniteExternalId;
  startTime?: Timestamp;
  endTime?: Timestamp;
  type?: string;
  subtype?: string;
  description?: string;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
  dataSetId?: CogniteInternalId;
  source?: string;
}

export interface ExternalFileInfo {
  externalId?: CogniteExternalId;
  name: FileName;
  source?: string;
  mimeType?: FileMimeType;
  directory?: string;
  metadata?: Metadata;
  assetIds?: CogniteInternalId[];
  dataSetId?: CogniteInternalId;
  securityCategories?: CogniteInternalId[];
  sourceCreatedTime?: Date;
  sourceModifiedTime?: Date;
  labels?: Label[];
  geoLocation?: FileGeoLocation;
}

/**
 * Prefix filter on externalId. (case-sensitive)
 */
export type ExternalIdPrefix = string;

export interface ExternalSequence extends SequenceBase {
  /**
   * List of column definitions
   */
  columns: ExternalSequenceColumn[];
}

/**
 * Describes a new column
 */
export interface ExternalSequenceColumn
  extends ExternalSequenceColumnBase,
    ExternalId {}

interface ExternalSequenceColumnBase {
  name?: SequenceColumnName;
  description?: SequenceColumnDescription;
  valueType?: SequenceValueType;
  metadata?: Metadata;
}

export interface FileChange {
  update: {
    externalId?: SinglePatchString;
    source?: SinglePatchString;
    mimeType?: SinglePatchString;
    metadata?: ObjectPatch;
    assetIds?: ArrayPatchLong;
    securityCategories?: ArrayPatchLong;
    sourceCreatedTime?: SinglePatchDate;
    sourceModifiedTime?: SinglePatchDate;
    dataSetId?: NullableSinglePatchLong;
    labels?: LabelsPatch;
    geoLocation?: FileGeoLocationPatch;
  };
}

export type FileChangeUpdate =
  | FileChangeUpdateById
  | FileChangeUpdateByExternalId;

export interface FileChangeUpdateByExternalId extends ExternalId, FileChange {}

export interface FileChangeUpdateById extends InternalId, FileChange {}

export type FileContent = ArrayBuffer | Buffer | any;

export interface FileFilterProps {
  name?: FileName;
  mimeType?: FileMimeType;
  metadata?: Metadata;
  /**
   * Only include files that reference these specific asset IDs.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Only include files that have a related asset in a tree rooted at any of these root assetIds.
   */
  rootAssetIds?: IdEither[];
  /**
   * Only include items that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  /**
   * Only include files that are related to an asset in a subtree rooted at any of these assetIds.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  directoryPrefix?: string;
  source?: string;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  uploadedTime?: DateRange;
  sourceCreatedTime?: DateRange;
  sourceModifiedTime?: DateRange;
  externalIdPrefix?: ExternalIdPrefix;
  uploaded?: boolean;
  /**
   * Return only the resource matching the specified label constraints.
   */
  labels?: LabelFilter;
  geoLocation?: FileGeoLocationFilter;
}

export interface FileFilter extends Limit {
  filter?: FileFilterProps;
}

export interface FileLink {
  downloadUrl: string;
}

/**
 * File type. E.g. text/plain, application/pdf, ...
 */
export type FileMimeType = string;

/**
 * Name of the file.
 */
export type FileName = string;

export interface FileRequestFilter extends FilterQuery, FileFilter {}

export interface FileInfo extends ExternalFileInfo, CreatedAndLastUpdatedTime {
  id: CogniteInternalId;
  /**
   * Whether or not the actual file is uploaded
   */
  uploaded: boolean;
  uploadedTime?: Date;
}

export interface FilesSearchFilter extends FileFilter {
  search?: {
    name?: FileName;
  };
}

export interface DatapointAggregate extends DatapointInfo {
  average?: number;
  max?: number;
  min?: number;
  count?: number;
  sum?: number;
  interpolation?: number;
  stepInterpolation?: number;
  continuousVariance?: number;
  discreteVariance?: number;
  totalVariation?: number;
}

export interface DatapointInfo {
  timestamp: Date;
}

export interface DoubleDatapoint extends DatapointInfo {
  value: number;
}

export interface StringDatapoint extends DatapointInfo {
  value: string;
}

export interface Timeseries extends InternalId, CreatedAndLastUpdatedTime {
  /**
   * Externally supplied id of the time series
   */
  externalId?: CogniteExternalId;
  name?: TimeseriesName;
  isString: TimeseriesIsString;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  unit?: TimeseriesUnit;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  dataSetId?: CogniteInternalId;
  isStep: TimeseriesIsStep;
  /**
   * Description of the time series.
   */
  description: string;
  /**
   * Security categories required in order to access this time series.
   */
  securityCategories?: number[];
}

export interface ExternalTimeseries {
  /**
   * Externally provided id for the time series (optional but recommended)
   */
  externalId?: CogniteExternalId;
  /**
   * Set a value for legacyName to allow applications using API v0.3, v04, v05, and v0.6 to access this time series. The legacy name is the human-readable name for the time series and is mapped to the name field used in API versions 0.3-0.6. The legacyName field value must be unique, and setting this value to an already existing value will return an error. We recommend that you set this field to the same value as externalId.
   */
  legacyName?: string;
  /**
   * Human readable name of time series
   */
  name?: string;
  /**
   * Whether the time series is string valued or not.
   */
  isString?: boolean;
  /**
   * Additional metadata. String key -> String value.
   */
  metadata?: Metadata;
  /**
   * The physical unit of the time series.
   */
  unit?: string;
  /**
   * Asset that this time series belongs to.
   */
  assetId?: CogniteInternalId;
  /**
   * DataSet that this time series related with.
   */
  dataSetId?: CogniteInternalId;
  /**
   * Whether the time series is a step series or not.
   */
  isStep?: boolean;
  /**
   * Description of the time series.
   */
  description?: string;
  /**
   * Security categories required in order to access this time series."
   */
  securityCategories?: number[];
}

export type FileGeoLocationType = 'Feature';
export type FileGeoLocationGeometryType =
  | 'Point'
  | 'MultiPolygon'
  | 'MultiLineString'
  | 'MultiPoint'
  | 'Polygon'
  | 'LineString';
export type FileGeoLocationRelation = 'intersects' | 'disjoint' | 'within';

export type MultiPolygonCoordinates = PointCoordinates[][][];
export type MultiLineStringCoordinates = PointCoordinates[][];
export type MultiPointCoordinates = PointCoordinates[];
export type PolygonCoordinates = PointCoordinates[][];
export type LineStringCoordinates = PointCoordinates[];
export type PointCoordinates = Tuple2<number>;

export interface GeoLocationGeometry<T extends FileGeoLocationGeometryType, K> {
  type: T;
  coordinates: K;
}

/**
 * The geographic metadata of the file
 */
export interface FileGeoLocation {
  /**
   * One of the GeoJSON types. Currently only the 'Feature' type is supported
   */
  type: FileGeoLocationType;
  /**
   * Represents the points, curves and surfaces in the coordinate space
   */
  geometry: FileGeoLocationGeometry;
  /**
   * Additional properties in a String key -> Object value format
   */
  properties?: { [key: string]: any };
}

export type FileGeoLocationGeometry =
  /**
   * List of multiple polygons.
   * Each polygon is defined as a list of one or more linear rings representing a shape.
   * A linear ring is the boundary of a surface or the boundary of a hole in a surface.
   * It is defined as a list consisting of 4 or more Points, where the first and last Point is equivalent.
   * Each Point is defined as an array of 2 numbers, representing coordinates of a point in 2D space.
   * Example: [[[[30, 20], [45, 40], [10, 40], [30, 20]]], [[[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]]]]
   */
  | GeoLocationGeometry<'MultiPolygon', MultiPolygonCoordinates>
  /**
   * List of lines where each line (LineString) is defined as a list of two or more points.
   * Each point is defined as a pair of two numbers in an array, representing coordinates of a point in 2D space.
   * Example: [[[30, 10], [10, 30]], [[35, 10], [10, 30], [40, 40]]]
   */
  | GeoLocationGeometry<'MultiLineString', MultiLineStringCoordinates>
  /**
   * List of Points. Each Point is defined as an array of 2 numbers, representing coordinates of a point in 2D space.
   * Example: [[35, 10], [45, 45]]
   */
  | GeoLocationGeometry<'MultiPoint', MultiPointCoordinates>
  /**
   * List of one or more linear rings representing a shape.
   * A linear ring is the boundary of a surface or the boundary of a hole in a surface.
   * It is defined as a list consisting of 4 or more Points, where the first and last Point is equivalent.
   * Each Point is defined as an array of 2 numbers, representing coordinates of a point in 2D space.
   * Example: [[[35, 10], [45, 45], [15, 40], [10, 20], [35, 10]], [[20, 30], [35, 35], [30, 20], [20, 30]]]
   */
  | GeoLocationGeometry<'Polygon', PolygonCoordinates>
  /**
   * Coordinates of a line described by a list of two or more points.
   * Each point is defined as a pair of two numbers in an array, representing coordinates of a point in 2D space.
   * Example: [[30, 10], [10, 30], [40, 40]]
   */
  | GeoLocationGeometry<'LineString', LineStringCoordinates>
  /**
   * Coordinates of a point in 2D space, described as an array of 2 numbers.
   * Example: [4.306640625, 60.205710352530346]
   */
  | GeoLocationGeometry<'Point', PointCoordinates>;

export interface FileGeoLocationFilter {
  /**
   * One of the supported queries: "intersects" "disjoint" "within"
   */
  relation: FileGeoLocationRelation;
  /**
   * Represents the points, curves and surfaces in the coordinate space
   */
  shape: FileGeoLocationGeometry;
}

export type FileGeoLocationPatch = SetField<FileGeoLocation> | RemoveField;

export interface Group {
  name: GroupName;
  sourceId?: GroupSourceId;
  capabilities?: CogniteCapability;
  id: number;
  isDeleted: boolean;
  deletedTime?: Date;
}

/**
 * Name of the group
 * @example Production Engineers
 */
export type GroupName = string;

export interface GroupServiceAccount {
  /**
   * Unique name of the service account
   * @example some-internal-service@apple.com
   */
  name: string;
  id: CogniteInternalId;
  /**
   * List of group ids
   */
  groups: CogniteInternalId[];
  /**
   * If this service account has been logically deleted
   */
  isDeleted: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date;
}

/**
 * ID of the group in the source. If this is the same ID as a group in the IDP, a user in that group will implicitly be a part of this group as well.
 * @example b7c9a5a4-99c2-4785-bed3-5e6ad9a78603
 */
export type GroupSourceId = string;

export interface GroupSpec {
  name: GroupName;
  sourceId?: GroupSourceId;
  capabilities?: CogniteCapability;
}

export type Groups = CogniteInternalId[];

export interface IgnoreUnknownIds {
  /**
   * Ignore IDs and external IDs that are not found
   * @default false
   */
  ignoreUnknownIds?: boolean;
}

/**
 * Data about how to authenticate and authorize users
 */
export interface InputProjectAuthentication {
  azureADConfiguration?: AzureADConfiguration;
  validDomains?: ValidDomains;
  oAuth2Configuration?: OAuth2Configuration;
  applicationDomains?: ApplicationDomains;
}

/**
 * Range between two integers
 */
export type IntegerRange = Range<number>;

export type LIST = 'LIST';

export type LatestDataBeforeRequest =
  | (InternalId & LatestDataPropertyFilter)
  | (ExternalId & LatestDataPropertyFilter);

export interface LatestDataPropertyFilter {
  /**
   * Get first datapoint before this time. Format is N[timeunit]-ago where timeunit is w,d,h,m,s. Example: '2d-ago' will get everything that is up to 2 days old. Can also send time as a Date object or number of milliseconds since epoch.
   */
  before?: string | Date | number;
}

export interface List3DNodesQuery extends FilterQuery {
  /**
   * Get sub nodes up to this many levels below the specified node. Depth 0 is the root node.
   */
  depth?: number;
  /**
   * ID of a node that are the root of the subtree you request (default is the root node).
   */
  nodeId?: CogniteInternalId;
  /**
   * Filter for node properties. Only nodes that match all the given properties exactly will be listed. The filter must be a JSON object with the same format as the properties field.
   */
  properties?: Node3DProperties;
  /**
   * Partition specifier of the form "n/m". It will return the n'th (1-indexed) part of the result divided into m parts
   */
  partition?: Partition;
  /**
   * Enables sorting on node ID as opposed to tree index. This may result in faster response times for certain requests.
   */
  sortByNodeId?: boolean;
}

export interface Filter3DNodesQuery extends FilterQuery {
  /**
   * List filter
   */
  filter: {
    /**
     * Property filters. Nodes satisfy the filter if, for each property in the nested map(s), they have a value corresponding to that property that is contained within the list associated with that property in the map.
     */
    properties: { [key: string]: { [key: string]: string[] } };
  };
  /**
   * Partition specifier of the form "n/m". It will return the n'th (1-indexed) part of the result divided into m parts.
   */
  partition?: Partition;
}

export interface ListGroups {
  /**
   * Whether to get all groups, only available with the groups:list acl.
   */
  all?: boolean;
}

export type ListRawDatabases = FilterQuery;

export interface ListRawRows extends FilterQuery {
  /**
   * Set this to true if you only want to fetch row keys
   */
  onlyRowKeys?: boolean;
  /**
   * Specify this to limit columns to retrieve. Array of column keys
   */
  columns?: string[];
  /**
   * Exclusive filter for last updated time. When specified only rows updated after this time will be returned
   */
  minLastUpdatedTime?: Date;
  /**
   * Inclusive filter for last updated time. When specified only rows updated before this time will be returned
   */
  maxLastUpdatedTime?: Date;
}

export type ListRawTables = FilterQuery;

export type ListReveal3DNodeAncestors = FilterQuery;

export interface ListRevealSectors3DQuery extends FilterQuery {
  /**
   * Bounding box to restrict search to. If given, only return sectors that intersect the given bounding box. Given as a JSON-encoded object of two arrays \"min\" and \"max\" with 3 coordinates each.
   */
  boundingBox?: BoundingBox3D;
}

export interface ListSecurityCategories extends FilterQuery {
  sort?: 'ASC' | 'DESC';
}

export type MEMBEROF = 'MEMBEROF';

/**
 * Custom, application specific metadata.
 * Maximum length of key is 32 bytes, value 512 bytes, up to 16 key-value pairs.
 */
export interface Metadata {
  [key: string]: string;
}

export interface Model3D {
  /**
   * The name of the model.
   */
  name: string;
  /**
   * The ID of the model.
   */
  id: CogniteInternalId;
  createdTime: Date;
  metadata?: Metadata;
}

export interface Model3DListRequest extends FilterQuery {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

export interface NewApiKeyResponse extends ApiKeyObject {
  /**
   * The api key to be used against the API
   */
  value: string;
}

export interface Node3D {
  /**
   * The ID of the node.
   */
  id: CogniteInternalId;
  /**
   * The index of the node in the 3D model hierarchy, starting from 0.
   * The tree is traversed in a depth-first order.
   */
  treeIndex: number;
  /**
   * The parent of the node, null if it is the root node.
   */
  parentId: CogniteInternalId;
  /**
   * The depth of the node in the tree, starting from 0 at the root node.
   */
  depth: number;
  /**
   * The name of the node.
   */
  name: string;
  /**
   * The number of descendants of the node, plus one (counting itself).
   */
  subtreeSize: number;
  /**
   * Properties extracted from 3D model, with property categories containing key/value string pairs.
   */
  properties?: Node3DProperties;
  /**
   *  The bounding box of the subtree with this sector as the root sector.
   *  Is null if there are no geometries in the subtree.
   */
  boundingBox?: BoundingBox3D;
}

/**
 * Properties extracted from 3D model, with property categories containing key/value string pairs.
 */
export interface Node3DProperties {
  [category: string]: {
    [key: string]: string;
  };
}

export type NullableProperty<T> = T | { isNull: boolean };

export type NullableSinglePatchLong = { set: number } | { setNull: true };

export type NullableSinglePatchString = { set: string } | { setNull: true };

/**
 * Data related to generic OAuth2 authentication. Not used for Azure AD
 */
export interface OAuth2Configuration {
  /**
   * Login URL of OAuth2 provider. E.g https://accounts.google.com/o/oauth2/v2/auth.
   */
  loginUrl?: string;
  /**
   * Logout URL of OAuth2 provider. E.g https://accounts.google.com/Logout.
   */
  logoutUrl?: string;
  /**
   * URL to get access token from OAuth2 provider. E.g https://www.googleapis.com/oauth2/v4/token.
   */
  tokenUrl?: string;
  /**
   * Client ID. You probably get this when registering your client with the OAuth2 provider.
   */
  clientId?: string;
  /**
   * Client secret. You probably get this when registering your client with the OAuth2 provider.
   */
  clientSecret?: string;
}

export type OWNER = 'OWNER';

export type ObjectPatch =
  | {
      /**
       * Set the key-value pairs. All existing key-value pairs will be removed.
       */
      set: { [key: string]: string };
    }
  | {
      /**
       * Add the key-value pairs. Values for existing keys will be overwritten.
       */
      add: { [key: string]: string };
      /**
       * Remove the key-value pairs with given keys.
       */
      remove: string[];
    };

/**
 * Data about how to authenticate and authorize users. The authentication configuration is hidden.
 */
export interface OutputProjectAuthentication {
  validDomains?: ValidDomains;
  applicationDomains?: ApplicationDomains;
}

/**
 * Splits the data set into N partitions.
 * This should NOT be used for frontend applications.
 * Partitions are formatted as `n/m`, where `n` is the index of the parititon, and `m` is the total number or partitions.
 * i.e. 20 partitions would have one request with `partition: 1/20`, then another `partition: 2/20` and so on.
 * You need to use `autoPagingToArray(...)` on each partition in order to receive all the data.
 * @example 1/10
 */
export type Partition = string;

export interface ExternalDatapoint {
  timestamp: Timestamp;
  value: number | string;
}

/**
 * The display name of the project.
 * @example Open Industrial Data
 */
export type ProjectName = string;

/**
 * Information about the project
 */
export interface ProjectResponse {
  name: ProjectName;
  urlName: UrlName;
  defaultGroupId?: DefaultGroupId;
  authentication?: OutputProjectAuthentication;
  oidcConfiguration?: OidcConfiguration;
}

export interface ProjectUpdate {
  name?: ProjectName;
  defaultGroupId?: DefaultGroupId;
  authentication?: InputProjectAuthentication;
}

export interface OidcConfigurationUpdate {
  modify?: OidcConfigurationUpdateModify;
  set?: OidcConfiguration;
  setNull?: boolean;
}

export interface ClaimName {
  claimName: string;
}

export interface OidcConfigurationUpdateModify {
  jwksUrl?: SetField<string>;
  tokenUrl?: SinglePatchString;
  issuer?: SetField<string>;
  audience?: SetField<string>;
  skewMs?: SinglePatch<number>;
  accessClaims?: ArrayPatchClaimNames;
  scopeClaims?: ArrayPatchClaimNames;
  logClaims: ArrayPatchClaimNames;
}

export interface PartialProjectUpdate {
  update: ProjectUpdateObject;
}

export interface ProjectUpdateObject {
  name?: SinglePatchRequiredString;
  defaultGroupId?: NullableSinglePatchLong;
  validDomains?: ArrayPatchString;
  applicationDomains?: ArrayPatchString;
  authenticationProtocol?: SinglePatchRequiredString;
  azureADConfiguration?: SinglePatch<AzureADConfiguration>;
  oAuth2Configuration?: SinglePatch<OAuth2Configuration>;
  oidcConfiguration?: OidcConfigurationUpdate;
}

export interface OidcConfiguration {
  jwksUrl: string;
  tokenUrl?: string;
  issuer: string;
  audience: string;
  skewMs?: number;
  accessClaims: ClaimName[];
  scopeClaims: ClaimName[];
  logClaims: ClaimName[];
}

export type READ = 'READ';

export interface Range<T> {
  min?: T;
  max?: T;
}

export interface RawDBName {
  /**
   * Unique name of a database.
   */
  name: string;
}

/**
 * A NoSQL database to store customer data.
 */
export interface RawDB extends RawDBName {
  createdTime: Date;
}

export interface RawDBRow extends RawDBRowInsert {
  /**
   * Time when the row was last updated
   */
  lastUpdatedTime: Date;
}

export interface RawDBRowInsert extends RawDBRowKey {
  /**
   * Row data stored as a JSON object.
   */
  columns: Record<string, any>;
}

export interface RawDBRowKey {
  /**
   * Unique row key
   */
  key: string;
}

export interface RawDBTableName {
  /**
   * Unique name of the table
   */
  name: string;
}

export interface RawDBTable extends RawDBTableName {
  createdTime: Date;
}

export interface RemoveField {
  setNull: boolean;
}

export type RelationshipResourceType =
  | 'asset'
  | 'timeSeries'
  | 'file'
  | 'event'
  | 'sequence';

export interface ExternalRelationship {
  /**
   * External id of the relationship, must be unique within the project
   */
  externalId: CogniteExternalId;
  /**
   * External id of the CDF resource that constitutes the relationship source
   */
  sourceExternalId: CogniteExternalId;
  /**
   * Enum: "asset" "timeSeries" "file" "event" "sequence".
   * The CDF resource type of the relationship source. Must be one of the specified values.
   */
  sourceType: RelationshipResourceType;
  /**
   * External id of the CDF resource that constitutes the relationship target.
   */
  targetExternalId: CogniteExternalId;
  /**
   * Enum: "asset" "timeSeries" "file" "event" "sequence".
   * The CDF resource type of the relationship target. Must be one of the specified values.
   */
  targetType: RelationshipResourceType;
  /**
   * Time when the relationship became active.
   * If there is no startTime, relationship is active from the beginning of time until endTime.
   */
  startTime?: Timestamp;
  /**
   * Time when the relationship became inactive. If there is no endTime,
   * relationship is active from startTime until the present or any point in the future.
   * If endTime and startTime are set, then endTime must be strictly greater than startTime
   */
  endTime?: Timestamp;
  /**
   * Confidence value of the existence of this relationship.
   * Generated relationships should provide a realistic score on the likelihood of the existence of the relationship.
   * Relationships without a confidence value can be interpreted at the discretion of each project.
   */
  confidence?: number;
  /**
   * The id of the dataset this relationship belongs to
   */
  dataSetId?: CogniteInternalId;
  /**
   * A list of the labels associated with this resource item
   */
  labels?: Label[];
}

export interface Relationship
  extends ExternalRelationship,
    CreatedAndLastUpdatedTime {}

export interface RelationshipsFilterRequest extends FilterQuery {
  /**
   * Filter on relationships with exact match.
   * Multiple filter elements in one property, e.g. sourceExternalIds: [ "a", "b" ],
   * will return all relationships where the sourceExternalId field is either a or b.
   * Filters in multiple properties will return the relationships that match all criteria.
   * If the filter is not specified it default to an empty filter.
   */
  filter?: RelationshipsFilter;
}

export interface RelationshipsFilter extends CreatedAndLastUpdatedTimeFilter {
  /**
   * Include relationships that have any of these values in their sourceExternalId field
   */
  sourceExternalIds?: CogniteExternalId[];
  /**
   * Items Enum: "asset" "timeSeries" "file" "event" "sequence".
   * Include relationships that have any of these values in their sourceType field
   */
  sourceTypes?: RelationshipResourceType[];
  /**
   * Include relationships that have any of these values in their targetExternalId field
   */
  targetExternalIds?: CogniteExternalId[];
  /**
   * Items Enum: "asset" "timeSeries" "file" "event" "sequence".
   * Include relationships that have any of these values in their targetType field
   */
  targetTypes?: RelationshipResourceType[];
  /**
   * Only include relationships that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  startTime?: DateRange;
  endTime?: DateRange;
  /**
   * Confidence range to filter for
   */
  confidence?: Range<number>;
  /**
   * Limits results to those active at any point within the given time range, i.e.
   * if there is any overlap in the intervals [activeAtTime.min, activeAtTime.max] and [startTime, endTime],
   * where both intervals are inclusive. If a relationship does not have a startTime,
   * it is regarded as active from the beginning of time by this filter.
   * If it does not have an endTime is will be regarded as active until the end of time.
   * Similarly, if a min is not supplied to the filter, the min will be implicitly set to the beginning of time,
   * and if a max is not supplied, the max will be implicitly set to the end of time.
   */
  activeAtTime?: DateRange;
  /**
   * Return only the resource matching the specified label constraints
   */
  labels?: LabelFilter;
}

export interface RevealNode3D extends Node3D {
  /**
   * The sector the node is contained in.
   */
  sectorId: CogniteInternalId;
}

export interface RevealRevision3D extends Revision3D {
  sceneThreedFiles: Versioned3DFile[];
}

export interface RevealSector3D {
  /**
   * The id of the sector.
   */
  id: CogniteInternalId;
  /**
   * The parent of the sector, null if it is the root sector.
   */
  parentId: CogniteInternalId;
  /**
   * String representing the path to the sector: 0/2/6/ etc.
   */
  path: string;
  /**
   * The depth of the sector in the sector tree, starting from 0 at the root sector.
   */
  depth: number;
  /**
   * The bounding box of the subtree with this sector as the root sector. Is null if there are no geometries in the subtree.
   */
  boundingBox: BoundingBox3D;
  /**
   * The file ID of the data file for this sector, with multiple versions supported. Use /3d/files/{id} to retrieve the file.
   */
  threedFiles: Versioned3DFile[];
}

export interface Revision3D {
  /**
   * The ID of the revision.
   */
  id: CogniteInternalId;
  /**
   * The file id.
   */
  fileId: CogniteInternalId;
  /**
   * True if the revision is marked as published.
   */
  published: boolean;
  /**
   * Global rotation to be applied to the entire model.
   * The rotation is expressed by Euler angles in radians and in XYZ order.
   */
  rotation?: Tuple3<number>;
  camera?: RevisionCameraProperties;
  /**
   * The status of the revision.
   */
  status: Revision3DStatus;
  /**
   * The threed file ID of a thumbnail for the revision.
   * Use /3d/files/{id} to retrieve the file.
   */
  thumbnailThreedFileId?: number;
  /**
   * The URL of a thumbnail for the revision.
   */
  thumbnailURL?: string;
  /**
   * The number of asset mappings for this revision.
   */
  assetMappingCount: number;
  /**
   *
   */
  createdTime: Date;
  metadata?: Metadata;
}

export interface Revision3DListRequest extends Limit {
  /**
   * Filter based on whether or not it has published revisions.
   */
  published?: boolean;
}

export type Revision3DStatus = 'Queued' | 'Processing' | 'Done' | 'Failed';

export interface RevisionCameraProperties {
  /**
   * Initial camera target.
   */
  target?: Tuple3<number>;
  /**
   * Initial camera position.
   */
  position?: Tuple3<number>;
}

export type RevisionMetadata = { [key: string]: string };

export type RevisionMetadataUpdate =
  | RevisionMetadataUpdateSet
  | RevisionMetadataUpdateAddRemove;

export interface RevisionMetadataUpdateSet {
  set: RevisionMetadata;
}

export interface RevisionMetadataUpdateAddRemove {
  /**
   * Key/value pairs to add
   */
  add?: RevisionMetadata;
  /**
   * Keys to remove
   */
  remove?: string[];
}

export interface SecurityCategory {
  /**
   * Name of the security category
   */
  name: string;
  /**
   * Id of the security category
   */
  id: number;
}

export interface SecurityCategorySpec {
  /**
   * Name of the security category
   */
  name: string;
}

/**
 * Information about the sequence stored in the database
 */
export interface Sequence
  extends SequenceBase,
    InternalId,
    CreatedAndLastUpdatedTime {
  columns: SequenceColumn[];
}

interface SequenceBase {
  name?: SequenceName;
  description?: SequenceDescription;
  /**
   * Asset this sequence is associated with
   */
  assetId?: CogniteInternalId;
  dataSetId?: CogniteInternalId;
  externalId?: CogniteExternalId;
  metadata?: Metadata;
}

export type SequenceChange = SequencePatch & IdEither;

/**
 * Information about a column stored in the database
 */
export interface SequenceColumn
  extends ExternalSequenceColumnBase,
    InternalId,
    CreatedAndLastUpdatedTime {
  valueType: SequenceValueType;
  externalId?: CogniteExternalId;
}

/**
 * Information about a column stored in the database
 */
export interface SequenceColumnBasicInfo {
  name?: SequenceColumnName;
  externalId?: ExternalId;
  valueType?: SequenceValueType;
}

/**
 * Description of the column
 */
export type SequenceColumnDescription = string;

/**
 *  Human readable name of the column
 */
export type SequenceColumnName = string;

/**
 * Description of the sequence
 */
export type SequenceDescription = string;

export interface SequenceFilter {
  filter?: {
    name?: SequenceName;
    externalIdPrefix?: ExternalIdPrefix;
    metadata?: Metadata;
    assetIds?: CogniteInternalId[];
    /**
     * Only include sequences that have a related asset in a tree rooted at any of these root assetIds.
     */
    rootAssetIds?: CogniteInternalId[];
    dataSetIds?: IdEither[];
    /**
     * Only include sequences that have a related asset in a subtree rooted at any of these assetIds.
     * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
     */
    assetSubtreeIds?: IdEither[];
    createdTime?: DateRange;
    lastUpdatedTime?: DateRange;
  };
}

/**
 * Element of type corresponding to the column type. May include NULL!
 */
export type SequenceItem = number | string | null;

export interface SequenceListScope extends SequenceFilter, Limit, Cursor {}

/**
 * Name of the sequence
 */
export type SequenceName = string;

export interface SequencePatch {
  update: {
    name?: SinglePatchString;
    description?: SinglePatchString;
    assetId?: NullableSinglePatchLong;
    dataSetId?: NullableSinglePatchLong;
    externalId?: SinglePatchString;
    endTime?: SinglePatchDate;
    metadata?: ObjectPatch;
  };
}

/**
 * A single row of datapoints
 */
export interface SequenceRowData {
  /**
   * The row number for this row
   */
  rowNumber: number;
  /**
   * List of values in order defined in the columns field
   * (Number of items must match. Null is accepted for missing values)
   */
  values: SequenceItem[];
}

export interface SequenceRowsData extends InternalId {
  externalId?: ExternalId;
  /**
   * Column external ids in the same order as the values for each row
   */
  columns: string[];
  /**
   * List of row information
   */
  rows: SequenceRowData[];
}

export type SequenceRowsDelete = SequenceRowsDeleteData & IdEither;

interface SequenceRowsDeleteData {
  /**
   * Rows to delete from a sequence
   */
  rows: number[];
}

export type SequenceRowsInsert = SequenceRowsInsertData & IdEither;

/**
 * Data from a sequence
 */
export interface SequenceRowsInsertData {
  /**
   * Column external ids in the same order as the values for each row
   */
  columns: string[];
  /**
   * List of row information
   */
  rows: SequenceRowData[];
}

export interface SequenceRowsResponseData extends InternalId {
  externalId?: ExternalId;
  columns: SequenceColumnBasicInfo[];
  rows: SequenceRowData[];
  nextCursor?: string;
}

/**
 * A request for datapoints stored
 */
export type SequenceRowsRetrieve = SequenceRowsRetriveData & IdEither;

interface SequenceRowsRetriveData extends Cursor, Limit {
  /**
   * Lowest row number included.
   * @default 0
   */
  start?: number;
  /**
   * Get rows up to, but excluding, this row number.
   * @default "no limit"
   */
  end?: number;
  /**
   * Columns to be included. Specified as list of column externalIds.
   * In case this filter is not set, all available columns will be returned.
   */
  columns?: string[];
}

export interface SequenceSearchFilter extends SequenceFilter {
  search?: {
    name?: SequenceName;
    description?: SequenceDescription;
    /**
     * Search on name and description using wildcard search on each of the words (separated by spaces).
     * Retrieves results where at least one word must match. Example: '*some* *other*'
     */
    query?: string;
  };
}

export const SequenceValueType = {
  STRING: 'STRING' as SequenceValueType,
  DOUBLE: 'DOUBLE' as SequenceValueType,
  LONG: 'LONG' as SequenceValueType,
};

/**
 * What type the datapoints in a column will have.
 * DOUBLE is restricted to the range [-1E100, 1E100]
 * @default STRING
 */
export type SequenceValueType = 'STRING' | 'DOUBLE' | 'LONG';

export interface ServiceAccount {
  name: ServiceAccountName;
  groups?: Groups;
  id: CogniteInternalId;
  /**
   * If this service account has been logically deleted
   */
  isDeleted?: boolean;
  /**
   * Time of deletion
   */
  deletedTime?: Date;
}

export interface ServiceAccountInput {
  name: ServiceAccountName;
  groups?: Groups;
}

/**
 * Unique name of the service account
 */
export type ServiceAccountName = string;

export interface SetField<T> {
  set: T;
}

export type SingleCogniteCapability =
  | { groupsAcl: AclGroups }
  | { assetsAcl: AclAssets }
  | { eventsAcl: AclEvents }
  | { filesAcl: AclFiles }
  | { usersAcl: AclUsers }
  | { projectsAcl: AclProjects }
  | { securityCategoriesAcl: AclSecurityCategories }
  | { rawAcl: AclRaw }
  | { timeSeriesAcl: AclTimeseries }
  | { apikeysAcl: AclApiKeys }
  | { threedAcl: Acl3D }
  | { sequencesAcl: AclSequences }
  | { analyticsAcl: AclAnalytics }
  | { datasetsAcl: AclDataSets };

export type SinglePatch<T> = { set: T } | { setNull: boolean };

export type SinglePatchDate = { set: Timestamp } | { setNull: boolean };

export interface SinglePatchRequiredString {
  set: string;
}

export type SinglePatchString = SetField<string> | RemoveField;

export const SortOrder = {
  ASC: 'asc' as SortOrder,
  DESC: 'desc' as SortOrder,
};

/**
 * Items can be sorted in either ascending or descending order
 */
export type SortOrder = 'asc' | 'desc';

export interface SyntheticDataError extends DatapointInfo {
  error: string;
}

export type SyntheticDatapoint = SyntheticDataValue | SyntheticDataError;

export interface SyntheticDataValue extends DatapointInfo {
  value: number;
}

/**
 * A query for a synthetic time series
 */
export interface SyntheticQuery extends Limit {
  expression: string;
  start?: string | Timestamp;
  end?: string | Timestamp;
}

/**
 * Response of a synthetic time series query
 */
export interface SyntheticQueryResponse {
  isString?: TimeseriesIsString;
  datapoints: SyntheticDatapoint[];
}

export interface TimeSeriesPatch {
  update: {
    externalId?: NullableSinglePatchString;
    name?: NullableSinglePatchString;
    metadata?: ObjectPatch;
    unit?: NullableSinglePatchString;
    assetId?: NullableSinglePatchLong;
    dataSetId?: NullableSinglePatchLong;
    description?: NullableSinglePatchString;
    securityCategories?: ArrayPatchLong;
  };
}

export interface TimeseriesSearch {
  /**
   * Prefix and fuzzy search on name.
   */
  name?: string;
  /**
   * Prefix and fuzzy search on description.
   */
  description?: string;
  /**
   * Search on name and description using wildcard search on each of the words (separated by spaces). Retrieves results where at least one word must match. Example: '*some* *other*'
   */
  query?: string;
}

export interface TimeseriesSearchFilter extends Limit {
  filter?: TimeseriesFilter;
  search?: TimeseriesSearch;
}

export type TimeSeriesUpdate =
  | TimeSeriesUpdateById
  | TimeSeriesUpdateByExternalId;

export interface TimeSeriesUpdateByExternalId
  extends TimeSeriesPatch,
    ExternalId {}

export interface TimeSeriesUpdateById extends TimeSeriesPatch, InternalId {}

export interface TimeseriesFilter extends CreatedAndLastUpdatedTimeFilter {
  name?: TimeseriesName;
  unit?: TimeseriesUnit;
  isString?: TimeseriesIsString;
  isStep?: TimeseriesIsStep;
  metadata?: Metadata;
  /**
   * Get time series related to these assets. Takes [ 1 .. 100 ] unique items.
   */
  assetIds?: CogniteInternalId[];
  /**
   * Asset External IDs of related equipment that this time series relates to.
   */
  assetExternalIds?: CogniteExternalId[];
  /**
   * Only include timeseries that have a related asset in a tree rooted at any of these root assetIds.
   */
  rootAssetIds?: CogniteInternalId[];
  /**
   * Only include assets that reference these specific dataSet IDs
   */
  dataSetIds?: IdEither[];
  /**
   * Only include timeseries that are related to an asset in a subtree rooted at any of these assetIds.
   * If the total size of the given subtrees exceeds 100,000 assets, an error will be returned.
   */
  assetSubtreeIds?: IdEither[];
  externalIdPrefix?: ExternalIdPrefix;
}

export interface TimeseriesFilterQuery extends FilterQuery {
  filter?: TimeseriesFilter;
  partition?: Partition;
}

export type TimeseriesIdEither = InternalId | ExternalId;

/**
 * Whether the time series is a step series or not.
 */
export type TimeseriesIsStep = boolean;

/**
 * Whether the time series is string valued or not.
 */
export type TimeseriesIsString = boolean;

/**
 * Name of time series
 */
export type TimeseriesName = string;

/**
 * The physical unit of the time series.
 */
export type TimeseriesUnit = string;

/**
 * A point in time, either a number or a Date object.
 * The Date is converted to a number when api calls are made.
 */
export type Timestamp = number | Date;

export type Tuple3<T> = T[];

export type Tuple2<T> = [T, T];

export type UPDATE = 'UPDATE';

export interface UnrealRevision3D extends Revision3D {
  sceneThreedFiles: Versioned3DFile[];
}

export interface UpdateModel3D extends UpdateModelNameField, InternalId {}

export interface UpdateModelNameField {
  update: {
    name: SetField<string>;
  };
}

export interface UpdateRevision3D {
  id: CogniteInternalId;
  update: {
    /**
     * True if the revision is marked as published.
     */
    published?: SetField<boolean>;
    /**
     * Global rotation to be applied to the entire model.
     * The rotation is expressed by Euler angles in radians and in XYZ order.
     */
    rotation?: SetField<Tuple3<number>>;
    /**
     * Initial camera target.
     */
    camera?: SetField<RevisionCameraProperties>;
    /**
     * Revision metadata.
     */
    metadata?: RevisionMetadataUpdate;
  };
}

export interface FileUploadResponse extends FileInfo {
  uploadUrl: string;
}

/**
 * The url name of the project. This is used as part of API calls. It should only contain letters, digits and hyphens, as long as the hyphens are not at the start or end.
 * @example publicdata
 */
export type UrlName = string;

/**
 * List of valid domains. If left empty, any user registered with the OAuth2 provider will get access.
 */
export type ValidDomains = string[];

/**
 * List of domains permitted for redirects. Redirects as part of a login flow may only target a domain (or subdomain) on this list. If this list is set to be empty, it will not be possible to use a login flow.
 */
export type ApplicationDomains = string[];

/**
 * The file ID of the data file for this resource, with multiple versions supported.
 * Use /3d/files/{id} to retrieve the file.
 */
export interface Versioned3DFile {
  /**
   * Version of the file format.
   */
  version: number;
  /**
   * File ID. Use /3d/files/{id} to retrieve the file.
   */
  fileId: CogniteInternalId;
}

export type WRITE = 'WRITE';

export type ContextJobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export const ContextJobStatus = {
  QUEUED: 'QUEUED' as ContextJobStatus,
  RUNNING: 'RUNNING' as ContextJobStatus,
  COMPLETED: 'COMPLETED' as ContextJobStatus,
  FAILED: 'FAILED' as ContextJobStatus,
};

/**
 * Contextualization job ID.
 */
export type ContextJobId = number;

export interface ContextJobInfo {
  /**
   * The status of the job.
   */
  status: ContextJobStatus;
  createdTime: Date;
  startTime: Date;
  statusTime: Date;
}

export interface EntityMatchingResponseBase extends ContextJobInfo {
  /**
   * User defined name of the model.
   */
  name: string;
  /**
   * User defined description of the model
   */
  description: string;
}

export interface ExternalEntityToMatch {
  id?: CogniteInternalId;
  externalId?: CogniteExternalId;
  [key: string]: string | number | undefined;
}

export type EntityMatchingFeatureType =
  | 'simple'
  | 'bigram'
  | 'frequencyweightedbigram'
  | 'bigramextratokenizers'
  | 'bigramcombo';

export const EntityMatchingFeatureType = {
  SIMPLE: 'simple' as EntityMatchingFeatureType,
  BIGRAM: 'bigram' as EntityMatchingFeatureType,
  FREQUENCY_WEIGHTED_BIGRAM: 'frequencyweightedbigram' as EntityMatchingFeatureType,
  BIGRAM_EXTRA_TOKENIZERS: 'bigramextratokenizers' as EntityMatchingFeatureType,
  BIGRAM_COMBO: 'bigramcombo' as EntityMatchingFeatureType,
};

export type EntityMatchingClassifier =
  | 'randomforest'
  | 'decisiontree'
  | 'logisticregression'
  | 'augmentedlogisticregression'
  | 'augmentedrandomforest';

export const EntityMatchingClassifier = {
  RANDOM_FOREST: 'randomforest' as EntityMatchingClassifier,
  DECISION_TREE: 'decisiontree' as EntityMatchingClassifier,
  LOGISTIC_REGRESSION: 'logisticregression' as EntityMatchingClassifier,
  AUGMENTED_LOGISTIC_REGRESSION: 'augmentedlogisticregression' as EntityMatchingClassifier,
  AUGMENTED_RANDOM_FOREST: 'augmentedrandomforest' as EntityMatchingClassifier,
};

export interface EntityMatchingField {
  from: string;
  to: string;
}

export type ExternalEntityTrueMatch = ExternalEntityTrueMatchSource &
  ExternalEntityTrueMatchTarget;

type ExternalEntityTrueMatchSource =
  | {
      /**
       * The id for the source object of the match.
       */
      sourceId: CogniteInternalId;
    }
  | {
      /**
       * The external id for the source object of the match.
       */
      sourceExternalId: CogniteExternalId;
    };

type ExternalEntityTrueMatchTarget =
  | {
      /**
       * The id for the target object of the match.
       */
      targetId: CogniteInternalId;
    }
  | {
      /**
       * The external id for the target object of the match.
       */
      targetExternalId: CogniteExternalId;
    };

export interface EntityMatchingCreateRequest {
  /**
   * List of custom source object to match from, for example, time series. String key -> value. Only string values are considered in the matching. Optional id and/or externalId fields.
   */
  sources: ExternalEntityToMatch[];
  /**
   * List of custom target object to match to, for example, assets. String key -> value. Only string values are considered in the matching. Optional id and/or externalId fields.
   */
  targets: ExternalEntityToMatch[];
  /**
   * List of objects of pairs of fromId or fromExternalId and toId or toExternalId, that corresponds to entities in matchFrom and matchTo respectively, that indicates a confirmed match used to train the model. If omitted, an unsupervised model is used.
   */
  trueMatches?: ExternalEntityTrueMatch[];
  externalId?: CogniteExternalId;
  /**
   * User defined name of the model.
   */
  name?: string;
  /**
   * User defined description of the model.
   */
  description?: string;
  /**
   * List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * Defines the combination of features used. The options are:
   * Simple: Calculates a single cosine-distance similarity score for each of the fields defined in keysFromTo. This is the fastest option.
   * Bigram: Adds similarity score based on the sequence of the terms.
   * Frequency-Weighted-Bigram: Calculates a similarity score based on the sequence of the terms, giving higher weights to less commonly occurring tokens.
   * Bigram-Extra-Tokenizers: Similar to bigram, but able to learn that leading zeros and spaces should be ignored in matching.
   * Bigram-Combo: Calculates all of the above options, relying on the model to determine the appropriate features to use. This is the slowest option.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * The classifier used in the model. Only relevant if there are trueMatches/labeled data and a supervised  model is fitted.
   */
  classifier?: EntityMatchingClassifier;
  /**
   * If True, replaces missing fields in `sources` or `targets` entities, for fields set in set in `matchFields`, with empty strings. Else, returns an error if there are missing data.
   */
  ignoreMissingFields?: boolean;
}

export interface EntityMatchingCreateResponse
  extends EntityMatchingResponseBase {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  /**
   * Defines the combination of features used in the entity matcher model.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * Name of the classifier used in the model, "Unsupervised" if unsupervised model.
   */
  classifier?: EntityMatchingClassifier;
  /**
   * If True, missing fields in sources or targets entities set in matchFields, are replaced with empty strings.
   */
  ignoreMissingFields?: boolean;
  /**
   * List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalId?: CogniteInternalId;
}

export interface EntityMatchingModel extends EntityMatchingResponseBase {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  /**
   * Defines the combination of features used in the entity matcher model.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * Name of the classifier used in the model, "Unsupervised" if unsupervised model.
   */
  classifier?: EntityMatchingClassifier;
  /**
   * Array of objects (MatchFields) List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalId?: number;
}

export type EntityMatchingChange = IdEither & EntityMatchingPatch;

export interface EntityMatchingPatch {
  update: {
    /**
     * Set a new value for the model name.
     */
    name?: SinglePatchString;
    /**
     * Set a new value for the model description.
     */
    description: SinglePatchString;
  };
}

export type EntityMatchingPredictRequest = IdEither &
  EntityMatchingPredictRequestBase;

interface EntityMatchingPredictRequestBase {
  /**
   * List of source entities to predict matches for, for example, time series. If omitted, will use data source fit.
   */
  sources?: ExternalEntityToMatch[];
  /**
   * LList of potential target entities to match to one or more of the source entities, for example, assets. If omitted, will use data from fit.
   */
  targets?: ExternalEntityToMatch[];
  /**
   * The maximum number of results to return for each matchFrom.
   */
  numMatches?: number;
  /**
   * Only return matches with score above this threshold.
   */
  scoreThreshold?: number;
}

export interface EntityMatchingPredictResponse
  extends EntityMatchingResponseBase {
  /**
   * Contextualization job ID.
   */
  jobId: number;
}

export type EntityMatchingRefitRequest = IdEither &
  EntityMatchingRefitRequestBase;

interface EntityMatchingRefitRequestBase {
  /**
   * External ID for the new refitted model provided by client. Should be unique within the project.
   */
  newExternalId?: CogniteExternalId;
  /**
   * List of additional confirmed matches used to train the model. The new model uses a combination of this and trueMatches from the orginal model. If there are identical match-from ids, the pair from the original model is dropped.
   */
  trueMatches: ExternalEntityTrueMatch[];
  /**
   * List of source entities, for example, time series. If omitted, will use data from fit.
   */
  sources?: ExternalEntityToMatch[];
  /**
   * List of target entities, for example, assets. If omitted, will use data from fit.
   */
  targets?: ExternalEntityToMatch[];
}

export interface EntityMatchingRefitResponse
  extends EntityMatchingResponseBase {
  id: CogniteInternalId;
  externalId: CogniteExternalId;
  /**
   * Defines the combination of features used in the entity matcher model.
   */
  featureType: EntityMatchingFeatureType;
  /**
   * Name of the classifier used in the model, "Unsupervised" if unsupervised model.
   */
  classifier: EntityMatchingClassifier;
  /**
   * If True, missing fields in sources or targets entities set in matchFields, are replaced with empty strings.
   */
  ignoreMissingFields?: boolean;
  /**
   * List of pairs of fields from the target and source items used to calculate features. All source and target items should have all the source and target fields specified here.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalId: CogniteInternalId;
}

export interface EntityMatchingPredictions {
  jobId: ContextJobId;
  /**
   * The status of the job.
   */
  status: ContextJobStatus;
  /**
   * List of matched entities with confidence score.
   */
  items: EntityMatchingPrediction[];
}

export interface EntityMatchingPrediction {
  /**
   * The matchFrom item given to predict.
   */
  matchFrom: ExternalEntityToMatch;
  /**
   * Matched items, sorted from highest score to lowest. May be empty.
   */
  matches: EntityMatchingPredictedItem[];
}

export interface EntityMatchingPredictedItem {
  /**
   * The matchTo item given to predict.
   */
  matchTo: ExternalEntityToMatch;
  /**
   * The model's confidence in the match.
   */
  score: number;
}

export interface EntityMatchingFilter {
  /**
   * User defined name of the model.
   */
  name?: string;
  /**
   * User defined description of the model.
   */
  description?: string;
  /**
   * The feature type used to fit the model.
   */
  featureType?: EntityMatchingFeatureType;
  /**
   * Name of the classifier supervised model, "Unsupervised" if unsupervised model
   */
  classifier?: string;
  /**
   * List of pairs of fields from the matchTo and matchFrom items used to create features.
   */
  matchFields?: EntityMatchingField[];
  /**
   * The ID of original model, only relevant when the model is a retrained model.
   */
  originalModelId?: CogniteInternalId;
}

export interface EntityMatchingFilterRequest extends FilterQuery {
  filter?: EntityMatchingFilter;
}

export interface DiagramResponseBase extends ContextJobInfo {
  /**
   * Contextualization job ID.
   */
  jobId: ContextJobId;
}

export interface DiagramDetectConfig {
  /**
   * This field determines the string to search for and to identify object entities.
   */
  searchField?: string;
  /**
   * Allow partial (fuzzy) matching of entities in the engineering diagrams. Creates a match only when it is possible to do so unambiguously.
   */
  partialMatch?: string;
  /**
   * Each detected item must match the detected entity on at least this number of tokens. A token is a substring of consecutive letters or digits.
   */
  minTokens?: number;
}

type FileIdEither =
  | {
      /**
       * The ID of a file in CDF.
       */
      fileId: CogniteInternalId;
    }
  | {
      /**
       * The external ID of a file in CDF.
       */
      fileExternalId: CogniteExternalId;
    };

type FileIdAndExternalId = {
  /**
   * The ID of a file in CDF.
   */
  fileId: CogniteInternalId;
  /**
   * The external ID of a file in CDF.
   */
  fileExternalId?: CogniteExternalId;
};

export interface DiagramDetectRequest extends DiagramDetectConfig {
  /**
   * An array of files (50 maximum) to detect entities in.
   */
  items: FileIdEither[];
  /**
   * A list of entities to look for in the engineering diagrams. For example, all the assets under a root node. The searchField determines the strings that identify the entities. The value of an entity searchField can be a string or a list of strings. If one of the strings is detected, the entity is added to the detection result.
   */
  entities: object[];
}

export interface DiagramDetectResponse
  extends DiagramResponseBase,
    DiagramDetectConfig {}

export interface Vertex {
  x: number;
  y: number;
}

export interface Region {
  shape: string;
  vertices: Vertex[];
  page: number;
}

export type Shape = 'points' | 'rectangle' | 'polyline' | 'polygon';

export const Shape = {
  POINTS: 'points' as Shape,
  RECTANGLE: 'rectangle' as Shape,
  POLYLINE: 'polyline' as Shape,
  POLYGON: 'polygon' as Shape,
};

export interface DiagramAnnotation {
  /**
   * The entity (e.g. a valve, a pump or text) detected by a computer vision model.
   */
  text: string;
  /**
   * The confidence for the detection.
   */
  confidence: number;
  /**
   * Shape and coordinates of the detected entity in the file.
   */
  region: Region;
  /**
   * A list of entities to look for in the engineering diagrams. For example, all the assets under a root node. The searchField determines the strings that identify the entities.
   */
  entities: object[];
}

export interface DiagramAnnotations {
  annotations: DiagramAnnotation[];
}

export interface ErrorMessage {
  /**
   * The error message for the page and file.
   */
  errorMessage?: string;
}

export interface DiagramDetectResultItem
  extends FileIdAndExternalId,
    DiagramAnnotations,
    ErrorMessage {}

export interface DiagramDetectResult extends DiagramDetectResponse {
  items: DiagramDetectResultItem[];
}

export type DiagramConvertRequestItem = FileIdEither & DiagramAnnotations;

export interface DiagramConvertConfig {
  /**
   * Return the SVG version in grayscale colors only (reduces the file size).
   */
  grayscale?: boolean;
}

export interface DiagramConvertRequest extends DiagramConvertConfig {
  items: DiagramConvertRequestItem[];
}

export interface DiagramConvertResponse
  extends DiagramResponseBase,
    DiagramConvertConfig {}

export interface DiagramSvgPngResult extends ErrorMessage {
  page: number;
  /**
   * The page of the file where the annotations in annotations were detected.
   */
  /**
   * A signed URL to an interactive SVG version of the engineering diagram (valid for 10 minutes).
   */
  svgUrl: string;
  /**
   * A signed URL to a PNG version of the engineering diagram (valid for 10 minutes).
   */
  pngUrl: string;
}

export interface DiagramConvertResultItem
  extends FileIdAndExternalId,
    ErrorMessage {
  results: DiagramSvgPngResult[];
}

export interface DiagramConvertResult
  extends DiagramResponseBase,
    DiagramConvertConfig {
  items: DiagramConvertResultItem[];
}
