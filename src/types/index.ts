export type AppLanguage = 'BN' | 'EN';
export type AppUnit = 'FEET' | 'METERS';

export type AppTab = 'CALCULATOR' | 'TRIANGULATION' | 'KHATIAN' | 'AI_ASSISTANT' | 'HISTORY';

export type LandShape =
  | 'RECTANGLE'
  | 'SQUARE'
  | 'TRIANGLE'
  | 'RHOMBUS'
  | 'PARALLELOGRAM'
  | 'TRAPEZIUM'
  | 'PENTAGON'
  | 'HEXAGON'
  | 'CUBE'
  | 'QUADRILATERAL'
  | 'FREEFORM';

export type TriangleMethod = 'BASE_HEIGHT' | 'THREE_SIDES';

export type PriceUnit = 'SOTANGSO' | 'KATHA' | 'BIGHA';

export interface CalculationResult {
  sqFeet: number;
  sqMeters: number;
  sotangso: number;
  katha: number;
  bigha: number;
  acre: number;
  hectare?: number;
  chhatak?: number;
  cubeVolume?: number; // CFT (Cubic Feet) or m3
  cubeSurface?: number; // Sq.Ft or Sq.M
}

export interface CustomTriangle {
  id: string;
  sideA: string;
  sideB: string;
  sideC: string;
  areaSqFt?: number;
  areaSqM?: number;
  sotangso?: number;
  isValid?: boolean;
}

export interface KhatianPartner {
  id: string;
  name: string;
  shareType: 'DECIMAL' | 'TRADITIONAL';
  decimalShare: string; // e.g. 0.250
  // Traditional Ana-Gonda-Kara-Kranti-Til
  ana: string;
  gonda: string;
  kara: string;
  kranti: string;
  til: string;
  // Computed outputs
  shareRatio?: number;
  sotangso?: number;
  katha?: number;
  bigha?: number;
  sqFeet?: number;
  price?: number;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  tabType: string;
  shapeType: string;
  shape?: LandShape | 'KHATIAN' | 'TRIANGULATION' | string;
  unit: AppUnit;
  inputsDesc: string;
  inputs?: Record<string, string>;
  result?: CalculationResult;
  sqFeet: number;
  sqMeters: number;
  sotangso: number;
  katha: number;
  bigha: number;
  totalPrice?: number;
  triangleMethod?: TriangleMethod;
  landPrice?: number;
  priceUnit?: PriceUnit;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: number;
  image?: string;
}
