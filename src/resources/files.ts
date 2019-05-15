// Copyright 2019 Cognite AS

import { AxiosInstance } from 'axios';
import { CogniteAsyncIterator } from '../autoPagination';
import { rawRequest } from '../axiosWrappers';
import { MetadataMap } from '../metadata';
import {
  generateDeleteEndpoint,
  generateListEndpoint,
  generateRetrieveEndpoint,
  generateRetrieveSingleEndpoint,
  generateSearchEndpoint,
  generateUpdateEndpoint,
} from '../standardMethods';
import {
  CogniteInternalId,
  ExternalFilesMetadata,
  FileChangeUpdate,
  FileContent,
  FileLink,
  FileRequestFilter,
  FilesMetadata,
  FilesSearchFilter,
  IdEither,
  ItemsResponse,
  UploadFileMetadataResponse,
} from '../types/types';
import { projectUrl } from '../utils';

export interface FilesAPI {
  /**
   * [List files](https://doc.cognitedata.com/api/v1/#operation/advancedListFiles)
   *
   * ```js
   * const files = await client.files.list({filter: {mimeType: 'image/png'}});
   * ```
   */
  list: (scope?: FileRequestFilter) => CogniteAsyncIterator<FilesMetadata>;

  /**
   * [Upload a file](https://doc.cognitedata.com/api/v1/#operation/initFileUpload)
   *
   * ```js
   * // automatic upload:
   * const file = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpg'}, fileContent);
   *
   * // manual with uploadUrl:
   * const file = await client.files.upload({name: 'examplefile.jpg', mimeType: 'image/jpg'});
   * // then upload using the file.uploadUrl
   * ```
   */
  upload: (
    metadata: ExternalFilesMetadata,
    fileContent?: FileContent,
    // tslint:disable-next-line:bool-param-default
    waitUntilAcknowledged?: boolean
  ) => Promise<UploadFileMetadataResponse>;

  /**
   * [Retrieve files](https://doc.cognitedata.com/api/v1/#operation/byIdsFiles)
   *
   * ```js
   * const files = await client.files.retrieve([{id: 123}, {externalId: 'abc'}]);
   * ```
   */
  retrieve: (ids: IdEither[]) => Promise<FilesMetadata[]>;

  /**
   * [Search for files](https://doc.cognitedata.com/api/v1/#operation/searchFiles)
   *
   * ```js
   * const files = await client.files.search([{
   *   filter: {
   *     mimeType: 'image/jpg',
   *   },
   *   search: {
   *     name: 'Pump'
   *   }
   * }]);
   * ```
   */
  search: (query: FilesSearchFilter) => Promise<FilesMetadata[]>;

  /**
   * [Delete files](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   */
  delete: (ids: IdEither[]) => Promise<{}>;

  /**
   * [Get download urls](https://doc.cognitedata.com/api/v1/#operation/deleteFiles)
   *
   * ```js
   * await client.files.delete([{id: 123}, {externalId: 'abc'}]);
   */
  getDownloadUrls: (ids: IdEither[]) => Promise<(FileLink & IdEither)[]>;

  /**
   * [Update files](https://doc.cognitedata.com/api/v1/#operation/updateFiles)
   *
   * ```js
   * const files = await client.files.update([{id: 123, update: {description: {set: 'New description'}}}]);
   * ```
   */
  update: (changes: FileChangeUpdate[]) => Promise<FilesMetadata[]>;
}

function waitUntilFileIsUploaded(
  fileId: CogniteInternalId,
  axiosInstance: AxiosInstance,
  resourcePath: string,
  frequencyInMs: number = 1000
) {
  return new Promise((resolve, reject) => {
    try {
      const retrieve = generateRetrieveSingleEndpoint<
        CogniteInternalId,
        FilesMetadata
      >(axiosInstance, resourcePath, new MetadataMap());

      const myInterval = setInterval(async () => {
        if ((await retrieve(fileId)).uploaded) {
          clearInterval(myInterval);
          resolve();
        }
      }, frequencyInMs);
    } catch (e) {
      reject(e);
    }
  });
}

function generateUploadEndpoint(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function upload(
    fileMetadata: ExternalFilesMetadata,
    fileContent?: FileContent,
    waitUntilAcknowledged: boolean = false
  ): Promise<UploadFileMetadataResponse> {
    const response = await rawRequest<UploadFileMetadataResponse>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/initupload`,
        data: fileMetadata,
      }
    );
    const file = response.data;
    if (fileContent != null) {
      const { uploadUrl } = file;
      const headers: any = {};
      if (fileMetadata.mimeType != null) {
        headers['Content-Type'] = fileMetadata.mimeType;
      }
      await rawRequest(axiosInstance, {
        method: 'put',
        url: uploadUrl,
        headers,
        data: fileContent,
      });
    }
    if (waitUntilAcknowledged) {
      await waitUntilFileIsUploaded(file.id, axiosInstance, resourcePath);
    }
    return metadataMap.addAndReturn(file, response);
  };
}

function generateDownloadUrlEndpoint<RequestType, ResponseType>(
  axiosInstance: AxiosInstance,
  resourcePath: string,
  metadataMap: MetadataMap
) {
  return async function downloadUrl(
    items: RequestType[]
  ): Promise<ResponseType[]> {
    const response = await rawRequest<ItemsResponse<ResponseType>>(
      axiosInstance,
      {
        method: 'post',
        url: `${resourcePath}/downloadlink`,
        data: { items },
      },
      true
    );
    return metadataMap.addAndReturn(response.data.items, response);
  };
}

/** @hidden */
export function generateFilesObject(
  project: string,
  instance: AxiosInstance,
  map: MetadataMap
): FilesAPI {
  const path = projectUrl(project) + '/files';
  return {
    list: generateListEndpoint(instance, path, map, true),
    upload: generateUploadEndpoint(instance, path, map),
    retrieve: generateRetrieveEndpoint(instance, path, map),
    search: generateSearchEndpoint(instance, path, map),
    delete: generateDeleteEndpoint(instance, path, map),
    getDownloadUrls: generateDownloadUrlEndpoint(instance, path, map),
    update: generateUpdateEndpoint(instance, path, map),
  };
}
