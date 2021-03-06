import { Wellhead } from './wellhead';
import { Wellbore } from './Wellbore';
import { Asset } from '@cognite/sdk';
import { DoubleWithUnit } from './DoubleWithUnit';

// Customizable function that takes in CogniteClient and args, and return a promise of a well
export type SearchWells = (args: any) => Promise<Well[]>;
export type SearchWell = (args: any) => Promise<Well>;

/**
 * Collection of Well objects and a cursor for fetching the next collection
 */
export interface WellItems {
  /**
   * @type {Well[]}
   * @memberof Well
   */
  items: Well[];
  /**
   * @type {string}
   * @memberof Well
   */
  nextCursor?: string;
}
/**
 * A well is an assets and sets the basis of the well data model hierarchy
 * @export
 * @interface Well
 */
export interface Well {
  /**
   * @type {number}
   * @memberof Well
   */
  id: number;
  /**
   * @type {string}
   * @memberof Well
   */
  name: string;
  /**
   * @type {string}
   * @memberof Well
   */
  externalId?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  description?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  country?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  quadrant?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  block?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  field?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  operator?: string;
  /**
   * @type {number}
   * @memberof Well
   */
  spudDate?: Date;
  /**
   * @type {string}
   * @memberof Well
   */
  wellType?: string;
  /**
   * @type {string}
   * @memberof Well
   */
  license?: string;
  /**
   * @type {Date}
   * @memberof Well
   */
  waterDepth?: DoubleWithUnit;
  /**
   * @type {Wellhead}
   * @memberOf Well
   */
  wellhead?: Wellhead;
  /**
   * @type {WellDatum}
   * @memberof Well
   */
  datum?: WellDatum;
  /**
   * @type {string[]}
   * @memberof Well
   */
  sources?: string[];
  /**
   * @type {Promise<Wellbore[]>}
   * @memberof Wellbore
   */
  wellbores(): Promise<Wellbore[]>;
  /**
   * If the source parameter is set, it will only return source assets from that source system.
   * The source parameter can for example be EDM, Diskos, Openworks, etc.
   * @type {Promise<Asset[]>}
   * @memberof Wellbore
   */
  sourceAssets(source?: string): Promise<Asset[]>;
}

export interface WellDatum {
  /**
   * @type {string}
   * @memberof WellDatum
   */
  name?: string;
  /**
   * @type {number}
   * @memberof WellDatum
   */
  elevation: number;
  /**
   * @type {string}
   * @memberof WellDatum
   */
  unit: string;
  /**
   * @type {string}
   * @memberof WellDatum
   */
  reference?: string;
}

export interface WellsLimits {
  /**
   * @type {SpudDateLimits}
   * @memberof WellsLimits
   */
  spudDate: SpudDateLimits;
  /**
   * @type {WaterDepthLimits}
   * @memberof WellsLimits
   */
  waterDepth: WaterDepthLimits;
  /**
   * @type {DoubleRange}
   * @memberof WellsLimits
   */
  nptDuration: DoubleRange;
}

export interface WaterDepthLimits {
  /**
   * @type {DoubleWithUnit}
   * @memberof WaterDepthLimits
   */
  min: DoubleWithUnit;
  /**
   * @type {DoubleWithUnit}
   * @memberof WaterDepthLimits
   */
  max: DoubleWithUnit;
}

export interface SpudDateLimits {
  /**
   * @type {Date}
   * @memberof SpudDateLimits
   */
  min: Date;
  /**
   * @type {Date}
   * @memberof SpudDateLimits
   */
  max: Date;
}
