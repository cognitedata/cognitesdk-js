// Copyright 2020 Cognite AS

import { Constants } from '@cognite/sdk-core';
import CogniteClientPlayground from '../cogniteClientPlayground';
import { apiKey, mockBaseUrl, project } from '@cognite/sdk-core/src/testUtils';

export function setupClient(baseUrl: string = Constants.BASE_URL) {
  return new CogniteClientPlayground({
    appId: 'JS SDK integration tests (playground)',
    baseUrl,
  });
}

export function setupLoggedInClient() {
  const client = setupClient();
  client.loginWithApiKey({
    project: process.env.COGNITE_PROJECT as string,
    apiKey: process.env.COGNITE_CREDENTIALS as string,
  });
  return client;
}

export function setupMockableClient() {
  const client = setupClient(mockBaseUrl);
  client.loginWithApiKey({
    project,
    apiKey,
  });
  return client;
}
