# Migration guide from 1.x.x to 2.x.x

Short migration guide on how to upgrade from SDK version 1.x.x to 2.x.x.

## Constructor

In 2.x.x you need to create a new SDK instance before you can use the SDK:

```js
const client = new CogniteClient({ appId: 'YOUR APPLICATION NAME' });
```

After that you need to authenticate your client with calling one of these methods on the client:

With api-key:

```js
client.loginWithApiKey({ project, apiKey });
```

With OAuth:

```js
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'publicdata',
}});
```

For more info about OAuth-authentication look [here](./authentication.md).

For quickstarts and samples go [here](../samples/).

## Changes

| 1.x.x                                                            | 2.x.x                                                                                             |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **AUTHENTICATION**                                               |
| `sdk.Login.authorize(...)`                                       | See [constructor-section](#constructor)                                                           |
| `sdk.Login.loginWithApiKey(...)`                                 | See [constructor-section](#constructor)                                                           |
| `sdk.Logout.logout()`                                            | Removed                                                                                           |
| `sdk.Logout.retrieveLogoutUrl(...)`                              | Removed                                                                                           |
| **ASSETS**                                                       |
| `sdk.Assets.create([...])`                                       | `client.assets.create([...])`                                                                     |
| `sdk.Assets.retrieve(123)`                                       | `client.assets.retrieve([{id: 123}])`                                                             |
| `sdk.Assets.retrieveMultiple([123, 456])`                        | `client.assets.retrieve([{id: 123}, {id: 456}])`                                                  |
| `sdk.Assets.update(id, changes)`                                 | `client.assets.update([{id, update: changes}])`                                                   |
| `sdk.Assets.updateMultiple([{id, ...changes}])`                  | `client.assets.update([{id, update: changes}])`                                                   |
| `sdk.Assets.overwriteMultiple(...)`                              | Removed                                                                                           |
| `sdk.Assets.delete([id])`                                        | `client.assets.delete([{id: 123}])`                                                               |
| `sdk.Assets.list({name: 'abc'})`                                 | `client.assets.list({filter: {name: 'abc'}}).autoPagingToArray({limit: 1000})`                    |
| `sdk.Assets.listDescendants(id, params)`                         | Not implemented yet. Follow issue [here](https://github.com/cognitedata/cognite-sdk-js/issues/129) |
| `sdk.Assets.search({name: 'abc'})`                               | `client.assets.search({search: {name: 'abc'})`                                                    |
| **TIME SERIES**                                                  |
| `sdk.TimeSeries.create([...])`                                   | `client.timeseries.create([...])`                                                                 |
| `sdk.TimeSeries.retrieve(123)`                                   | `client.timeseries.retrieve([{id: 123}])`                                                         |
| `sdk.TimeSeries.retrieveMultiple([123, 456])`                    | `client.timeseries.retrieve([{id: 123}, {id: 456}])`                                              |
| `sdk.TimeSeries.update(id, changes)`                             | `client.timeseries.update([{id, update: changes}])`                                               |
| `sdk.TimeSeries.updateMultiple([{id, ...changes}])`              | `client.timeseries.update([{id, update: changes}])`                                               |
| `sdk.TimeSeries.list({limit: 20})`                               | `client.timeseries.list().autoPagingToArray({limit: 20})`                                         |
| `sdk.TimeSeries.search({name: 'abc'})`                           | `client.timeseries.search({search: {name: 'abc'}})`                                              |
| **DATA POINTS**                                                  |
| `sdk.Datapoints.insert(id, datapoints)`                          | `client.datapoints.insert([{id, datapoints}])`                                                    |
| `sdk.Datapoints.insertByName(...)`                               | Removed                                                                                           |
| `sdk.Datapoints.insertMultiple([{name, datapoints}])`            | Not supported using name. Use IDs instead: `client.datapoints.insert([{id, datapoints}])`         |
| `sdk.Datapoints.retrieve(id, params)`                            | `client.datapoints.retrieve({items: [{id}], ...params})`                                          |
| `sdk.Datapoints.retrieveByName(...)`                             | Removed (use ID instead)                                                                          |
| `sdk.Datapoints.retrieveMultiple(...)`                           | Not directly supported. Use `client.datapoints.retrieve`                                          |
| `sdk.Datapoints.retrieveLatest(name, before)`                    | Use IDs: `client.datapoints.retrieveLatest([{id, before}])`                                       |
| `client.datapoints.retrieveCSV(...)`                             | Removed                                                                                           |
| `sdk.Datapoints.delete(name, timestamp)`                         | Use IDs: `client.datapoints.delete([{id, inclusiveBegin: timestamp, exclusiveEnd: timestamp}])`   |
| `sdk.Datapoints.deleteRange(name, inclusiveBegin, exclusiveEnd)` | Use IDs: `client.datapoints.delete([{id, inclusiveBegin, exclusiveEnd}])`                         |
| **EVENTS**                                                       |
| `sdk.Events.create([...])`                                       | `client.events.create([...])`                                                                     |
| `sdk.Events.retrieve(id)`                                        | `client.events.retrieve([{id}])`                                                                  |
| `sdk.Events.retrieveMultiple([123, 456])`                        | `client.events.retrieve([{id: 123}, {id: 456}])`                                                  |
| `sdk.Events.update([{id, ...changes}])`                          | `client.events.update([{id, update: changes}])`                                                   |
| `sdk.Events.delete([id])`                                        | `client.events.delete([{id}])`                                                                    |
| `sdk.Events.list({limit: 20})`                                   | `client.events.list().autoPagingToArray({limit: 20})`                                             |
| `sdk.Events.search({name: 'abc'})`                               | `client.events.search({search: {name: 'abc'}})`                                                 |
| **FILES**                                                        |
| `sdk.Files.upload(fileMetadata, params)`                         | `client.files.upload(fileMetadata, fileContent?, overwrite?, waitUntilAcknowledged?)`             |
| `sdk.Files.download(id)`                                         | `client.files.getDownloadUrls([{id}])`                                                            |
| `sdk.Files.retrieveMetadata(id)`                                 | `client.files.retrieve([{id}])`                                                                   |
| `sdk.Files.retrieveMultipleMetadata([123, 456])`                 | `client.files.retrieve([{id: 123}, {id: 456}])`                                                   |
| `sdk.Files.updateMetadata(id, changes)`                          | `client.files.update([{id, update: changes}])`                                                    |
| `sdk.Files.updateMultipleMetadata([id, ...changes])`             | `client.files.update([{id, update: changes}])`                                                    |
| `sdk.Files.delete([id])`                                         | `client.files.delete([{id}])`                                                                     |
| `sdk.Files.list({limit: 20})`                                    | `client.files.list().autoPagingToArray({limit: 20})`                                              |
| `sdk.Files.search({name: 'abc'})`                                | `client.files.search({search: {name: 'abc'}})`                                                  |
| `sdk.Files.replaceMetadata(...)`                                 | Removed                                                                                           |
| **3D**                                                           |
| `sdk.ThreeD.createAssetMappings(modelId, revisionId, mappings)`  | `client.assetMappings3D.create(modelId, revisionId, mappings)`                                    |
| `sdk.ThreeD.createModels([name])`                                | `client.models3D.create([{name}])`                                                                |
| `sdk.ThreeD.createRevisions(modelId, revisions)`                 | `client.revisions3D.create(modelId, revisions)`                                                   |
| `sdk.ThreeD.retrieveFile(fileId, responseType)`                  | `client.files3D.retrieve(fileId)`                                                                 |
| `sdk.ThreeD.retrieveModel(modelId)`                              | `client.models3D.retrieve(modelId)`                                                               |
| `sdk.ThreeD.retrieveRevision(modelId, revisionId)`               | `client.models3D.retrieve(modelId, revisionId)`                                                   |
| `sdk.ThreeD.updateModels({id, name})`                            | `client.models3D.update([{id, update: {name}])`                                                   |
| `sdk.ThreeD.updateRevisions(modelId, {id, ...changes})`          | `client.revisions3D.update(modelId, [{id, update: changes])`                                      |
| `sdk.ThreeD.updateRevisionThumbnail(...)`                        | `client.revisions3D.updateThumbnail(modelId, revisionId, fileId)` |
| `sdk.ThreeD.deleteModels([id])`                                  | `client.models3D.delete([{id}])`                                                                  |
| `sdk.ThreeD.deleteRevisions(modelId, [id])`                      | `client.revisions3D.delete(modelId, [{id}])`                                                      |
| `sdk.ThreeD.deleteAssetMappings(modelId, revisionId, mappings)`  | `client.assetMappings3D.delete(modelId, revisionId, mappings)`                                    |
| `sdk.ThreeD.listAssetMappings(modelId, revisionId, params)`      | `client.assetMappings3D.list(modelId, revisionId, params).autoPagingToArray()`                    |
| `sdk.ThreeD.listModels(params)`                                  | `client.models3D.list(params).autoPagingToArray()`                                                |
| `sdk.ThreeD.listNodes(modelId, revisionId, params)`              | `client.revisions3D.list3DNodes(modelId, revisionId, params).autoPagingToArray()`                 |
| `sdk.ThreeD.listNodeAncestors(modelId, revisionId, params)`      | `client.revisions3D.list3DNodeAncestors(modelId, revisionId, nodeId, params).autoPagingToArray()` |
| `sdk.ThreeD.listRevisions(modelId, params)`                      | `client.revisions3D.list(modelId, params).autoPagingToArray()`                                    |
| `sdk.ThreeD.listSectors(modelId, revisionId, params)`            | `client.viewer3D.listRevealSectors3D(modelId, revisionId, params).autoPagingToArray()`            |
