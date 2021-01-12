import { accessApi, CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { Well } from '../model/Well';
import { Measurement, Measurements } from '../model/Measurement';
import { MeasurementType } from '../model/MeasurementType';
import { Survey, SurveyData } from '../model/Survey';
import { Wellbore } from '../model/Wellbore';
import { SurveysAPI } from './surveysApi';

export class WellboresAPI {
  private client?: CDFHttpClient;
  private project?: String;
  private cluster?: String;

  private _surveysSDK?: SurveysAPI;

  public set surveysSdk(sdk: SurveysAPI) {
    this._surveysSDK = sdk;
  }

  private get surveys(): SurveysAPI {
    return accessApi(this._surveysSDK);
  }

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  public set setCluster(cluster: String) {
    this.cluster = cluster;
  }

  private addLazyMethodsForWellbore = (wellbore: Wellbore): Wellbore => {
    return <Wellbore>{
      id: wellbore.id,
      name: wellbore.name,
      metadata: wellbore.metadata,
      trajectory: async (): Promise<Survey | undefined>  => {return await this.surveys.getTrajectory(wellbore.id).then(response => response).catch(err => err)}
    };
  }

  private addLazyMethodsForMeasurement = (measurement: Measurement): Measurement => {
    return <Measurement>{
      id: measurement.id,
      externalId: measurement.externalId,
      name: measurement.name,
      data: async (): Promise<SurveyData | undefined>  => {return await this.surveys.getData({id: measurement.id}).then(response => response).catch(err => err)}
    };
  }

  private getPath(baseUrl: string): string {
    if (this.project == undefined){
      throw new HttpError(400, "The client project has not been set.", {})
    }
    if (this.cluster == undefined) {
      throw new HttpError(400, "No cluster has been set.", {})
    }
    baseUrl = `/${this.project}${baseUrl}?env=${this.cluster}`
    return baseUrl
  }

  /* eslint-disable */
  public getById = async (id: number): Promise<Wellbore | undefined> => {
    const path: string = this.getPath(`/wellbores/${id}`)
    return await this.client?.get<Wellbore>(path)
      .then(response => this.addLazyMethodsForWellbore(response.data))
      .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getFromWell = async (well: Well): Promise<Wellbore[] | undefined> => {
    const path: string = this.getPath(`/wells/${well.id}/wellbores`)
    try {
      const wellboreData = await this.client?.get<Wellbore[]>(path)
      if (wellboreData) {
        return wellboreData.data.map(wellbore => this.addLazyMethodsForWellbore(wellbore))
      } else {
        return undefined
      }
    } catch(err) {
      throw new HttpError(err.status, err.errorMessage, {})
    }
  }

  /* eslint-disable */
  public getTrajectory = async (wellboreId: number): Promise<Survey | undefined> => {

      const path: string = this.getPath(`/wellbores/${wellboreId}/trajectory`)

      return await this.client?.get<Survey>(path)
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
    });
  };

  public getMeasurement = async (wellboreId: number, measurementType: MeasurementType): Promise<Measurement[] | undefined> => {

    const path: string = this.getPath(`/wellbores/${wellboreId}/measurements/${measurementType}`)

    let measurements = await this.client?.get<Measurements>(path)
    .then(response => response.data)
    .catch(err => {
      throw new HttpError(err.status, err.errorMessage, {})
    })

    return measurements?.items.map(measurement => this.addLazyMethodsForMeasurement(measurement)) 
  }
}
