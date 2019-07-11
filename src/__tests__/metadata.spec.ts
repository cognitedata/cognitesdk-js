// Copyright 2019 Cognite AS

import { MetadataMap } from '../metadata';

test('metadata', async () => {
  const map = new MetadataMap();
  const value = {};
  const response = { status: 200, headers: {} };
  expect(map.addAndReturn(value, response)).toBe(value);
  const result = map.get(value);
  expect(result).not.toBeUndefined();
  expect(result!.status).toBe(response.status);
  expect(result!.headers).toBe(response.headers);
});