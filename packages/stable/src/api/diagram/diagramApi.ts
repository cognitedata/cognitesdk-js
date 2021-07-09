// Copyright 2020 Cognite AS

import { BaseResourceAPI } from '@cognite/sdk-core';
import {
  DiagramResponseBase,
  DiagramDetectRequest,
  DiagramDetectResponse,
  DiagramDetectResult,
  DiagramConvertRequest,
  DiagramConvertResponse,
  DiagramConvertResult,
  ContextJobId,
} from '../../types';

export class DiagramApi extends BaseResourceAPI<DiagramResponseBase> {
  /**
   * @hidden
   */
  protected getDateProps() {
    return this.pickDateProps(
      ['items'],
      ['createdTime', 'startTime', 'statusTime']
    );
  }

  /**
   * [Detect annotations in engineering diagrams](https://docs.cognite.com/api/v1/#operation/diagramDetect)
   *
   * ```js
   * const result = await client.diagram.detect({
   *  items: [{ fileExternalId: 'foo.pdf' }],
   *  entities: [{ name: 'abc' }],
   * });
   * ```
   */
  public detect = async (
    scope: DiagramDetectRequest
  ): Promise<DiagramDetectResponse> => {
    const path = this.url('detect');
    const response = await this.post<DiagramDetectResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve engineering diagram detect results](https://docs.cognite.com/api/v1/#operation/diagramDetectResults)
   *
   * ```js
   * const { status, items } = await client.diagram.detectResult(12345678);
   * ```
   */
  public detectResult = async (
    jobId: ContextJobId
  ): Promise<DiagramDetectResult> => {
    const path = this.url(`detect/${jobId}`);
    const response = await this.get<DiagramDetectResult>(path);
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Create an interactive engineering diagram](https://docs.cognite.com/api/v1/#operation/diagramConvert)
   *
   * ```js
   * const result = await client.diagram.convert({
   * items: [{ fileExternalId: "foo.pdf", annotations: [] }], grayscale: false});
   * ```
   */
  public convert = async (
    scope: DiagramConvertRequest
  ): Promise<DiagramConvertResponse> => {
    const path = this.url('convert');
    const response = await this.post<DiagramConvertResponse>(path, {
      data: scope,
    });
    return this.addToMapAndReturn(response.data, response);
  };

  /**
   * [Retrieve interactive engineering diagram](https://docs.cognite.com/api/v1/#operation/diagramConvertResults)
   *
   * ```js
   * const { status, items } = await client.diagram.convertResult(12345678);
   * ```
   */
  public convertResult = async (
    jobId: ContextJobId
  ): Promise<DiagramConvertResult> => {
    const path = this.url(`convert/${jobId}`);
    const response = await this.get<DiagramConvertResult>(path);
    return this.addToMapAndReturn(response.data, response);
  };
}
