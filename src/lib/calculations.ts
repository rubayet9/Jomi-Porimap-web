import { CalculationResult, CanvasPoint } from '../types';

export const FT_PER_METER = 3.2808398950131235;
export const SQ_FT_PER_SQ_M = 10.76391041671097;

// Bangladeshi Land Measurement Standards
export const SQ_FT_PER_SOTANGSO = 435.6; // 1 Sotangso / Decimal = 435.60 Sq.Ft
export const SQ_FT_PER_KATHA = 720.0;    // Standard Katha = 720.0 Sq.Ft (~1.65 Sotangso)
export const SQ_FT_PER_BIGHA = 14400.0;  // 1 Bigha = 20 Katha = 14,400 Sq.Ft (~33.06 Sotangso)
export const SQ_FT_PER_ACRE = 43560.0;   // 1 Acre = 100 Sotangso = 43,560 Sq.Ft
export const SQ_FT_PER_CHHATAK = 45.0;   // 1 Chhatak = 45 Sq.Ft (16 Chhatak = 1 Katha)
export const SQ_FT_PER_HECTARE = 107639.1; // 1 Hectare = 2.471 Acre

/**
 * Converts area in Sq. Feet to full Bangladesh land metrics
 */
export function computeLandMetrics(
  sqFeet: number,
  sotangsoPerKatha: number = 1.65289,
  cubeVolume?: number,
  cubeSurface?: number
): CalculationResult {
  const sqMeters = sqFeet / SQ_FT_PER_SQ_M;
  const sotangso = sqFeet / SQ_FT_PER_SOTANGSO;
  const katha = sotangso / sotangsoPerKatha;
  const bigha = sqFeet / SQ_FT_PER_BIGHA;
  const acre = sqFeet / SQ_FT_PER_ACRE;
  const hectare = sqFeet / SQ_FT_PER_HECTARE;
  const chhatak = sqFeet / SQ_FT_PER_CHHATAK;

  return {
    sqFeet,
    sqMeters,
    sotangso,
    katha,
    bigha,
    acre,
    hectare,
    chhatak,
    cubeVolume,
    cubeSurface,
  };
}

/**
 * Heron's formula for triangle with sides a, b, c
 */
export function heronFormula(a: number, b: number, c: number): number {
  if (a <= 0 || b <= 0 || c <= 0) return 0;
  if (a + b <= c || a + c <= b || b + c <= a) return 0;
  const s = (a + b + c) / 2.0;
  const val = s * (s - a) * (s - b) * (s - c);
  return val > 0 ? Math.sqrt(val) : 0;
}

/**
 * Validates if 3 sides form a valid triangle
 */
export function isValidTriangle(a: number, b: number, c: number): boolean {
  if (a <= 0 || b <= 0 || c <= 0) return false;
  return a + b > c && a + c > b && b + c > a;
}

/**
 * Shoelace Formula for irregular 2D polygon points
 * @param points Array of canvas points
 * @param scale Pixels per unit (e.g. 10px = 1ft or 1m)
 */
export function shoelaceFormula(points: CanvasPoint[], scale: number = 10): number {
  const n = points.length;
  if (n < 3) return 0;

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const current = points[i];
    const next = points[(i + 1) % n];

    // Scale coordinates down to real-world units
    const x1 = current.x / scale;
    const y1 = current.y / scale;
    const x2 = next.x / scale;
    const y2 = next.y / scale;

    sum += x1 * y2 - x2 * y1;
  }

  return Math.abs(sum) * 0.5;
}

/**
 * Converts Traditional Khatian units (Ana, Gonda, Kara, Kranti, Til) to Decimal Share (0.0000 - 1.0000)
 * Total 16 Ana = 153,600 Til
 */
export function traditionalToDecimalShare(
  ana: number = 0,
  gonda: number = 0,
  kara: number = 0,
  kranti: number = 0,
  til: number = 0
): number {
  // 1 Ana = 20 Gonda = 80 Kara = 240 Kranti = 4800 Til * 2 = 9600 Til
  // 16 Ana = 16 * 20 * 4 * 3 * 20 = 153,600 Til
  const totalTil =
    ana * 9600 +
    gonda * 480 +
    kara * 120 +
    kranti * 40 +
    til;

  return totalTil / 153600.0;
}

/**
 * Converts Decimal Share (0.0000 - 1.0000) to Traditional Ana-Gonda-Kara-Kranti-Til
 */
export function decimalToTraditionalShare(decimal: number): {
  ana: number;
  gonda: number;
  kara: number;
  kranti: number;
  til: number;
} {
  let remainingTil = Math.round(Math.max(0, Math.min(1, decimal)) * 153600);

  const ana = Math.floor(remainingTil / 9600);
  remainingTil %= 9600;

  const gonda = Math.floor(remainingTil / 480);
  remainingTil %= 480;

  const kara = Math.floor(remainingTil / 120);
  remainingTil %= 120;

  const kranti = Math.floor(remainingTil / 40);
  remainingTil %= 40;

  const til = remainingTil;

  return { ana, gonda, kara, kranti, til };
}

/**
 * Converts an input value when switching between Feet and Meters
 */
export function convertInputValue(
  valStr: string,
  fromUnit: 'FEET' | 'METERS',
  toUnit: 'FEET' | 'METERS'
): string {
  if (!valStr || isNaN(Number(valStr))) return valStr;
  const num = parseFloat(valStr);
  if (num === 0) return '0';

  if (fromUnit === 'FEET' && toUnit === 'METERS') {
    // Feet to Meters
    return (num / FT_PER_METER).toFixed(3).replace(/\.?0+$/, '');
  } else if (fromUnit === 'METERS' && toUnit === 'FEET') {
    // Meters to Feet
    return (num * FT_PER_METER).toFixed(3).replace(/\.?0+$/, '');
  }
  return valStr;
}

/**
 * Format currency in Bangladeshi Taka system (e.g. ৳ 12,34,567.89)
 */
export function formatBDT(amount: number): string {
  if (isNaN(amount) || amount === 0) return '৳ 0.00';

  const parts = amount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // South Asian formatting: 3 digits from right, then groups of 2
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `৳ ${formattedInt}.${decimalPart}`;
}

export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val)) return '0.00';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Computes total land valuation according to selected unit rate (SOTANGSO, KATHA, BIGHA)
 */
export function computeTotalPrice(
  metrics: CalculationResult,
  price: number,
  unit: 'SOTANGSO' | 'KATHA' | 'BIGHA' = 'SOTANGSO'
): number {
  if (!price || price <= 0) return 0;
  switch (unit) {
    case 'KATHA':
      return metrics.katha * price;
    case 'BIGHA':
      return metrics.bigha * price;
    case 'SOTANGSO':
    default:
      return metrics.sotangso * price;
  }
}

/**
 * Convert standard English digits to Bengali numerals
 */
export function toBengaliNumerals(val: string | number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
}

