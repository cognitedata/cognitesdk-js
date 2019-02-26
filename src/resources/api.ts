// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { Metadata, MetadataMap } from '../metadata';
import { AssetAPI, generateAssetsObject } from './assets';

export interface API {
  project: string;
  getMetadata: (value: any) => undefined | Metadata;
  assets: AssetAPI;
}

/** @hidden */
export function generateAPIObject(
  project: string,
  axiosInstance: AxiosInstance,
  metadataMap: MetadataMap
): API {
  return {
    project,
    getMetadata: value => metadataMap.get(value),
    assets: generateAssetsObject(project, axiosInstance, metadataMap),
  };
}
