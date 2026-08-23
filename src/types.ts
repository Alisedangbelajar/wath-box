export type CaliberType = 'Automatic' | 'Manual Wind' | 'Quartz' | 'Spring Drive';

export type BoxPapersStatus = 'Full Set' | 'Watch Only' | 'Box Only' | 'Papers Only';

export type PositionType = 
  | 'Dial Up (DU)' 
  | 'Dial Down (DD)' 
  | 'Crown Down (CD)' 
  | 'Crown Left (CL)' 
  | 'Crown Up (CU)' 
  | '12 Down (12D)' 
  | 'On Wrist (OW)';

export type WearOccasion = 'Daily / Office' | 'Casual / Weekend' | 'Dress / Formal' | 'Sport / Outdoor' | 'Travel';

export type ComplicationType = 
  | 'Chronograph' 
  | 'GMT / Dual Time' 
  | 'Diver (Rotating Bezel)' 
  | 'Moonphase' 
  | 'Perpetual Calendar' 
  | 'Date / Day-Date' 
  | 'Time Only' 
  | 'Power Reserve' 
  | 'Tourbillon'
  | 'Micro-Rotor';

export interface CaliberSpec {
  name: string;
  maker: string;
  type: CaliberType;
  baseCaliber?: string;
  isInHouse: boolean;
  frequencyVph: number; // e.g. 28800
  frequencyHz: number; // e.g. 4
  jewels: number;
  powerReserveHours: number;
  finishing: string[]; // e.g. ["Côtes de Genève", "Perlage", "Anglage"]
  escapement: string; // e.g. "Co-Axial Master Chronometer", "Swiss Lever Silicon Hairspring", "Tri-Synchro Regulator"
  certification?: string; // e.g. "METAS Master Chronometer", "COSC", "Rolex Superlative Chronometer"
}

export interface DimensionsSpec {
  caseDiameterMm: number;
  thicknessMm: number;
  lugToLugMm: number;
  lugWidthMm: number;
}

export interface AccuracyLogEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  position: PositionType;
  deviationSecPerDay: number; // e.g. +1.8 or -2.4
  amplitudeDeg?: number; // e.g. 295°
  beatErrorMs?: number; // e.g. 0.1ms
  notes?: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  serviceCenter: string;
  serviceType: 'Complete Overhaul' | 'Gasket & Pressure Test' | 'Regulation & Demagnetization' | 'Polishing / Refinish' | 'Crystal Replacement';
  costUsd: number;
  pressureTestBar?: number;
  warrantyExpiryDate?: string;
  notes: string;
}

export interface WatchItem {
  id: string;
  brand: string;
  model: string;
  nickname?: string;
  referenceNumber: string;
  yearOfProduction: number;
  complications: ComplicationType[];
  caliber: CaliberSpec;
  dimensions: DimensionsSpec;
  waterResistanceMeters: number;
  crystalType: string;
  bezelType: string;
  caseMaterial: string;
  dialColor: string;
  lumeType?: string;
  purchasePriceUsd: number;
  marketValueUsd: number;
  purchaseDate: string;
  boxAndPapers: BoxPapersStatus;
  serialNumberMasked: string; // e.g. "7894****"
  currentStrapId: string;
  isFavorite: boolean;
  imageUrl: string;
  casebackImageUrl?: string;
  lumeImageUrl?: string;
  dialMacroImageUrl?: string;
  wearCount: number;
  totalDaysWorn: number;
  lastWornTimestamp: number;
  serviceHistory: ServiceRecord[];
  accuracyLogs: AccuracyLogEntry[];
  notes?: string;
}

export interface StrapItem {
  id: string;
  name: string;
  brand: string;
  material: 'Horween Leather' | 'Alligator' | 'Sailcloth' | 'NATO Nylon' | 'Tropic FKM Rubber' | 'Milanese Mesh' | 'Oyster Steel' | 'Jubilee Steel' | 'Suede' | 'Titanium Link';
  color: string;
  lugWidthMm: number;
  buckleWidthMm: number;
  quickRelease: boolean;
  waterproof: boolean;
  imageUrl: string;
  priceUsd: number;
  acquiredDate: string;
}

export interface WearLogEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  watchId: string;
  strapId?: string;
  occasion: WearOccasion;
  rating?: number;
  notes?: string;
  photoUrl?: string;
}

export type ActiveTab = 'box' | 'wotd' | 'lab' | 'sotc';
