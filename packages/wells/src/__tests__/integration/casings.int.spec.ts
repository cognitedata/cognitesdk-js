import { setupLoggedInClient } from '../testUtils';
import CogniteWellsClient from 'wells/src/client/cogniteWellsClient';
import { Sequence, SequenceData } from 'wells/src/client/model/Sequence';
import { Wellbore } from 'wells/src/client/model/Wellbore';

// suggested solution/hack for conditional tests: https://github.com/facebook/jest/issues/3652#issuecomment-385262455
const describeIfCondition =
  process.env.COGNITE_WELLS_PROJECT && process.env.COGNITE_WELLS_CREDENTIALS
    ? describe
    : describe.skip;

describeIfCondition('CogniteClient setup in surveys - integration test', () => {
  let client: CogniteWellsClient;
  beforeAll(async () => {
    client = setupLoggedInClient();
  });

  test('Get casing from well id', async () => {
    const casingExtId = "casing:CasingWear";

    const wellId: number = 5432591169464385;

    const casings: Sequence[] | undefined = await client.wellbores.getCasings(wellId)

    /* eslint-disable */
    expect(casings?.length).toBeGreaterThan(0);
    casings?.forEach(casing => {
      expect(casing.externalId).toBe(casingExtId)
      expect(casing.columns?.length).toBe(7)
    })
  });

  test('Get casing from well id with 404', async () => {
    const wellId: number = 10000000000000;

      await client.wellbores.getCasings(wellId)
        .then(response => response)
        .catch(err => {
        expect(err.status).toBe(404);
      });
  });

  test('Get casings data from wellbore id', async () => {
    const casingExtId = "casing:CasingWear";

    const wellboreId: number = 8269456345006483;

    const casings: Sequence[] | undefined = await client.wellbores.getCasings(wellboreId)

    expect(casings?.length).toBeGreaterThan(0);
    casings?.forEach(async casing => {
      expect(casing.externalId).toBe(casingExtId)
      expect(casing.columns?.length).toBe(7)


      const data: SequenceData | undefined = await client.wellbores.getCasingsData(
        casing.id,
        undefined,
        undefined,
        undefined,
        undefined,
        100
      );

      expect(data).not.toBeUndefined();

      expect(data!.externalId).toBe(casingExtId);

      expect(data?.columns.length).toBe(7)
      expect(data?.rows.length).toBe(3)
    })
  });

  test('Get casings on the wellbore object', async () => {
    const wellId: number = 5432591169464385;

    const wellbores: Wellbore[] | undefined = await client.wellbores.getFromWell(wellId)
    expect(wellbores).not.toBeUndefined();
    
    wellbores?.forEach(async wellbore => {
      const casings: Sequence[] | undefined = await wellbore?.casings();
      expect(casings?.length).toBeGreaterThan(0);
      casings?.forEach(async casing => {
      expect(casing.columns?.length).toBe(7)
    })
    })
  });


  test('Get casing data on casing object', async () => {
    const casingExtId = "casing:CasingWear";

    const wellboreId: number = 8269456345006483;

    const casings: Sequence[] | undefined = await client.wellbores.getCasings(wellboreId)

    expect(casings?.length).toBeGreaterThan(0);
    casings?.forEach(async casing => {
      expect(casing.externalId).toBe(casingExtId)
      expect(casing.columns?.length).toBe(7)


      const data: SequenceData | undefined = await casing.data();

      expect(data).not.toBeUndefined();

      expect(data!.externalId).toBe(casingExtId);

      expect(data?.columns.length).toBe(7)
      expect(data?.rows.length).toBe(3)
    })
  });

});