import { CDFHttpClient, HttpError} from '@cognite/sdk-core';
import { SurveyData, SurveyDataRequest } from '../model/Survey';

export class SurveysAPI {
  private client?: CDFHttpClient;
  private project?: String;

  public set setHttpClient(httpClient: CDFHttpClient) {
    this.client = httpClient;
  }

  public set setProject(project: String) {
    this.project = project;
  }

  /* eslint-disable */
  public getData = async (surveyId: number, start?: number, end?: number, limit?: number, cursor?: string, columns?: string[]): Promise<SurveyData | undefined> => {

      if (this.project == undefined){
        throw new HttpError(400, "The client project has not been set.", {})
      }

      const request: SurveyDataRequest = {
        id: surveyId,
        start: start,
        end: end,
        limit: limit,
        cursor: cursor,
        columns: columns
      }

      const path: string = `/${this.project}/surveys/data`
      
      return await this.client?.post<SurveyData>(path, {'data': request})
      .then(response => response.data)
      .catch(err => {
        throw new HttpError(err.status, err.errorMessage, {})
      });
  };
}