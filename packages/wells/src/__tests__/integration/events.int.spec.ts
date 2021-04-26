// Copyright 2020 Cognite AS

import { setupLoggedInClient } from '../testUtils';
import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import { NPT } from "wells/src/client/model/NPT";
import { NPTFilter } from 'wells/src/client/model/NPTFilter';

enum LengthUnitEnum {
  METER = 'meter',
  FOOT = 'foot',
  INCH = 'inch',
  YARD = 'yard',
}

const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('List all NPT events', async () => {
    const nptEvents: NPT[] | undefined = await client.events.listEvents({})

    expect(nptEvents).not.toBeUndefined();
    /* eslint-disable */
    expect(nptEvents?.length).toBeGreaterThanOrEqual(2)
    const sourceEventExternalIds = nptEvents?.map(event => event.sourceEventExternalId)
    expect(sourceEventExternalIds).toContain("m2rmB")
  });

  test('Filter NPT Events by duration range and depth in meters', async () => {
    const filter: NPTFilter = {
      "duration": {"min": 21.0, "max": 23.0},
      "measuredDepth": {"min": 2000.0, "max": 3000.0, unit: LengthUnitEnum.METER}
    }

    const nptEvents: NPT[] | undefined = await client.events.listEvents(filter)

    expect(nptEvents).not.toBeUndefined();
    /* eslint-disable */
    const sourceEventExternalIds = nptEvents?.map(event => event.sourceEventExternalId)
    expect(sourceEventExternalIds).toContain("m2rmB")
  });

  test('Filter NPT Events by depth in feet', async () => {
    const filter: NPTFilter = {
      "measuredDepth": {"min": 9000.0, "max": 10000.0, unit: LengthUnitEnum.FOOT}
    }

    const nptEvents: NPT[] | undefined = await client.events.listEvents(filter)

    expect(nptEvents).not.toBeUndefined();
    /* eslint-disable */
    nptEvents?.forEach( event => {
        expect(event.measuredDepth?.unit).toBe(LengthUnitEnum.FOOT);
        expect(event.measuredDepth?.value).toBeGreaterThan(9000.0)
        expect(event.measuredDepth?.value).toBeLessThan(10000.0)
      }
    )
    const sourceEventExternalIds = nptEvents?.map(event => event.sourceEventExternalId)
    expect(sourceEventExternalIds).toContain("m2rmB")
  });

  test('Filter NPT events with no results', async () => {
    const filter: NPTFilter = {
      "duration": {"min": 21.0, "max": 23.0},
      nptCode: "some-code",
      nptCodeDetail: "some-detail",
    }

    const nptEvents: NPT[] | undefined = await client.events.listEvents(filter)

    expect(nptEvents).not.toBeUndefined();
    /* eslint-disable */
    expect(nptEvents?.length).toBe(0)
  });

  test('List all NPT codes', async () => {
    const nptCodes: string[] | undefined = await client.events.nptCodes()

    expect(nptCodes).not.toBeUndefined();
    /* eslint-disable */
    expect(nptCodes).toContain("ABCD")
  });

  test('List all NPT Detail codes', async () => {
    const nptCodes: string[] | undefined = await client.events.nptDetailCodes()

    expect(nptCodes).not.toBeUndefined();
    /* eslint-disable */
    expect(nptCodes).toContain("EFG")
  });
});