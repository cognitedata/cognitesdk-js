// Copyright 2020 Cognite AS
import {
  accessApi,
  apiUrl,
  BaseCogniteClient,
  RetryValidator,
} from '@cognite/sdk-core';
import { version } from '../package.json';
import { AssetMappings3DAPI } from './api/3d/assetMappings3DApi';
import { Files3DAPI } from './api/3d/files3DApi';
import { Models3DAPI } from './api/3d/models3DApi';
import { Revisions3DAPI } from './api/3d/revisions3DApi';
import { Viewer3DAPI } from './api/3d/viewer3DApi';
import { ApiKeysAPI } from './api/apiKeys/apiKeysApi';
import { AssetsAPI } from './api/assets/assetsApi';
import { DataPointsAPI } from './api/dataPoints/dataPointsApi';
import { DataSetsAPI } from './api/datasets/datasetsApi';
import { EntityMatchingApi } from './api/entityMatching/entityMatchingApi';
import { DiagramApi } from './api/diagram/diagramApi';
import { EventsAPI } from './api/events/eventsApi';
import { FilesAPI } from './api/files/filesApi';
import { GroupsAPI } from './api/groups/groupsApi';
import { LabelsAPI } from './api/labels/labelsApi';
import { ProjectsAPI } from './api/projects/projectsApi';
import { RawAPI } from './api/raw/rawApi';
import { RelationshipsApi } from './api/relationships/relationshipsApi';
import { SecurityCategoriesAPI } from './api/securityCategories/securityCategoriesApi';
import { SequencesAPI } from './api/sequences/sequencesApi';
import { ServiceAccountsAPI } from './api/serviceAccounts/serviceAccountsApi';
import { TimeSeriesAPI } from './api/timeSeries/timeSeriesApi';
import { retryValidator } from './retryValidator';

export default class CogniteClient extends BaseCogniteClient {
  public get assets() {
    return accessApi(this.assetsApi);
  }
  public get timeseries() {
    return accessApi(this.timeSeriesApi);
  }
  public get datapoints() {
    return accessApi(this.dataPointsApi);
  }
  public get sequences() {
    return accessApi(this.sequencesApi);
  }
  public get events() {
    return accessApi(this.eventsApi);
  }
  public get files() {
    return accessApi(this.filesApi);
  }
  public get labels() {
    return accessApi(this.labelsApi);
  }
  public get raw() {
    return accessApi(this.rawApi);
  }
  public get projects() {
    return accessApi(this.projectsApi);
  }
  public get groups() {
    return accessApi(this.groupsApi);
  }
  public get securityCategories() {
    return accessApi(this.securityCategoriesApi);
  }
  public get serviceAccounts() {
    return accessApi(this.serviceAccountsApi);
  }
  public get models3D() {
    return accessApi(this.models3DApi);
  }
  public get revisions3D() {
    return accessApi(this.revisions3DApi);
  }
  public get files3D() {
    return accessApi(this.files3DApi);
  }
  public get datasets() {
    return accessApi(this.datasetsApi);
  }
  public get assetMappings3D() {
    return accessApi(this.assetMappings3DApi);
  }
  public get viewer3D() {
    return accessApi(this.viewer3DApi);
  }
  public get apiKeys() {
    return accessApi(this.apiKeysApi);
  }
  public get relationships() {
    return accessApi(this.relationshipsApi);
  }
  public get entityMatching() {
    return accessApi(this.entityMatchingApi);
  }
  public get diagram() {
    return accessApi(this.diagramApi);
  }
  private assetsApi?: AssetsAPI;
  private timeSeriesApi?: TimeSeriesAPI;
  private dataPointsApi?: DataPointsAPI;
  private sequencesApi?: SequencesAPI;
  private eventsApi?: EventsAPI;
  private filesApi?: FilesAPI;
  private labelsApi?: LabelsAPI;
  private rawApi?: RawAPI;
  private projectsApi?: ProjectsAPI;
  private groupsApi?: GroupsAPI;
  private securityCategoriesApi?: SecurityCategoriesAPI;
  private serviceAccountsApi?: ServiceAccountsAPI;
  private models3DApi?: Models3DAPI;
  private relationshipsApi?: RelationshipsApi;
  private entityMatchingApi?: EntityMatchingApi;
  private diagramApi?: DiagramApi;
  private revisions3DApi?: Revisions3DAPI;
  private files3DApi?: Files3DAPI;
  private datasetsApi?: DataSetsAPI;
  private assetMappings3DApi?: AssetMappings3DAPI;
  private viewer3DApi?: Viewer3DAPI;
  private apiKeysApi?: ApiKeysAPI;

  protected get version() {
    return version;
  }

  protected getRetryValidator(): RetryValidator {
    return retryValidator;
  }

  protected initAPIs() {
    const models3DPath = '3d/models';

    this.assetsApi = this.apiFactory(AssetsAPI, 'assets');
    this.timeSeriesApi = this.apiFactory(TimeSeriesAPI, 'timeseries');
    this.dataPointsApi = this.apiFactory(DataPointsAPI, 'timeseries/data');
    this.sequencesApi = this.apiFactory(SequencesAPI, 'sequences');
    this.eventsApi = this.apiFactory(EventsAPI, 'events');
    this.filesApi = this.apiFactory(FilesAPI, 'files');
    this.labelsApi = this.apiFactory(LabelsAPI, 'labels');
    this.datasetsApi = this.apiFactory(DataSetsAPI, 'datasets');
    this.rawApi = this.apiFactory(RawAPI, 'raw/dbs');
    this.groupsApi = this.apiFactory(GroupsAPI, 'groups');
    this.securityCategoriesApi = this.apiFactory(
      SecurityCategoriesAPI,
      'securitycategories'
    );
    this.serviceAccountsApi = this.apiFactory(
      ServiceAccountsAPI,
      'serviceaccounts'
    );
    this.apiKeysApi = this.apiFactory(ApiKeysAPI, 'apikeys');
    this.models3DApi = this.apiFactory(Models3DAPI, models3DPath);
    this.relationshipsApi = this.apiFactory(RelationshipsApi, 'relationships');
    this.entityMatchingApi = this.apiFactory(
      EntityMatchingApi,
      'context/entitymatching'
    );
    this.diagramApi = this.apiFactory(DiagramApi, 'context/diagram');
    this.revisions3DApi = this.apiFactory(Revisions3DAPI, models3DPath);
    this.files3DApi = this.apiFactory(Files3DAPI, '3d/files');
    this.assetMappings3DApi = this.apiFactory(AssetMappings3DAPI, models3DPath);
    this.viewer3DApi = this.apiFactory(Viewer3DAPI, '3d');
    this.projectsApi = new ProjectsAPI(
      apiUrl(),
      this.httpClient,
      this.metadataMap
    );
  }
}
