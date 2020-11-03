// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import { SearchWellbores } from 'wells/src/client/model/Wellbore';
import CogniteClient from '../../client/cogniteClient';
import { SearchSurveys } from 'wells/src/client/model/Survey';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('standard filter - list all trajectories and its rows', async () => {
    const assetId = 4618298167286402;
    const trajectories = await client.surveys.listTrajectories(assetId);
    expect(trajectories.length).toBeGreaterThan(0);
    trajectories.forEach(async element => {
      expect(element.assetId).toBe(assetId);
      const rows = await element.rows();
      expect(rows.length).toBe(6);
    });
  });

  test('custom filter - list all trajectories and its rows', async () => {
    const assetId = 4618298167286402;

    const fn: SearchSurveys = async (args: number) =>
      await client.surveys.listTrajectories(args);

    const trajectories = await client.surveys.listTrajectories(assetId, fn);
    expect(trajectories.length).toBeGreaterThan(0);
    trajectories.forEach(async element => {
      expect(element.assetId).toBe(assetId);
      const rows = await element.rows();
      expect(rows.length).toBe(6);
    });
  });

  test('standard filter - Fetch wellbores, their trajectories and rows ', async () => {
    const fn: SearchWellbores = async (args: number) =>
      await client.wellbores.listChildren(args);

    const wellId = 2278618537691581;
    const response = await client.wellbores.listChildren(wellId, fn);
    response.forEach(async element => {
      expect(element.parentId).toBe(wellId);
      const trajectories = await element.trajectories();
      expect(trajectories.length).toBeGreaterThanOrEqual(0);
      if (trajectories.length != 0) {
        trajectories.forEach(async element => {
          const rows = await element.rows();
          if (rows.length != 0) {
            expect(rows.length).toBe(6);
          }
        });
      }
    });
  });
});
