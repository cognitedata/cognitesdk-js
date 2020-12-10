import { BaseCogniteClient } from '@cognite/sdk-core';
import { accessApi } from '@cognite/sdk-core';
import { WellsAPI } from './api/wellsApi';
import { WellboresAPI } from './api/wellboresApi';
import { SurveysAPI } from './api/surveysApi';
import { version } from '../../package.json';
import { WELL_SERVICE_BASE_URL } from './api/utils';

export default class CogniteWellsClient extends BaseCogniteClient {
  public get wells() {
    return accessApi(this.wellsApi);
  }

  public get wellbores() {
    return accessApi(this.wellboresApi);
  }

  public get surveys() {
    return accessApi(this.surveysApi);
  }

  private wellsApi?: WellsAPI;
  private wellboresApi?: WellboresAPI;
  private surveysApi?: SurveysAPI;

  protected initAPIs() {
    this.setBaseUrl(WELL_SERVICE_BASE_URL);

    // wells
    this.wellsApi = this.apiFactory(WellsAPI, 'wells');
    this.wellsApi.setHttpClient = this.httpClient;
    this.wellsApi.setProject = this.project;

    // wellbores
    this.wellboresApi = this.apiFactory(WellboresAPI, 'wellbores');
    this.wellboresApi.setHttpClient = this.httpClient;
    this.wellboresApi.setProject = this.project;

    // wellbores
    this.surveysApi = this.apiFactory(SurveysAPI, 'surveys');
    this.surveysApi.setHttpClient = this.httpClient;
    this.surveysApi.setProject = this.project;
  }

  protected get version() {
    return `wells/${version}`;
  }
}
