import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Award,
  Sparkles,
  Layers,
  Coins,
  BookOpen,
  Maximize2,
} from 'lucide-react';
import {
  AppLanguage,
  AppUnit,
  CalculationResult,
  LandShape,
  PriceUnit,
  TriangleMethod,
  CanvasPoint,
} from '../../types';
import { getTranslation } from '../../lib/translations';
import {
  formatBDT,
  formatNumber,
  toBengaliNumerals,
  computeTotalPrice,
} from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { sound } from '../../lib/sound';

interface CalculationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  shape: LandShape;
  inputs: Record<string, string>;
  unit: AppUnit;
  triangleMethod?: TriangleMethod;
  freeformPoints?: CanvasPoint[];
  landPrice: number;
  priceUnit: PriceUnit;
  sotangsoPerKatha: number;
  lang: AppLanguage;
}

export const CalculationResultModal: React.FC<CalculationResultModalProps> = ({
  isOpen,
  onClose,
  result,
  shape,
  inputs,
  unit,
  triangleMethod,
  freeformPoints,
  landPrice,
  priceUnit,
  sotangsoPerKatha,
  lang,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const unitLabel = unit === 'FEET' ? (lang === 'BN' ? 'ফুট' : 'ft') : (lang === 'BN' ? 'মিটার' : 'm');

  const fmt = (val?: number, decimals: number = 3): string => {
    if (val === undefined || isNaN(val)) return '0.00';
    const s = val.toFixed(decimals);
    return lang === 'BN' ? toBengaliNumerals(s) : s;
  };

  const fmtInt = (val?: number): string => {
    if (val === undefined || isNaN(val)) return '0.00';
    const s = formatNumber(val, 2);
    return lang === 'BN' ? toBengaliNumerals(s) : s;
  };

  const shapeTitleMap: Record<LandShape, { en: string; bn: string }> = {
    RECTANGLE: { en: 'Rectangle', bn: 'আয়তক্ষেত্র' },
    SQUARE: { en: 'Square', bn: 'বর্গক্ষেত্র' },
    TRIANGLE: { en: 'Triangle', bn: 'ত্রিভুজ' },
    RHOMBUS: { en: 'Rhombus', bn: 'রম্বস' },
    PARALLELOGRAM: { en: 'Parallelogram', bn: 'সামান্তরিক' },
    TRAPEZIUM: { en: 'Trapezium', bn: 'ট্রাপিজিয়াম' },
    PENTAGON: { en: 'Pentagon', bn: 'পঞ্চভুজ' },
    HEXAGON: { en: 'Hexagon', bn: 'ষড়ভুজ' },
    CUBE: { en: 'Cube (3D / Earth)', bn: 'কিউব / মাটিকাটা' },
    QUADRILATERAL: { en: 'Irregular Quadrilateral', bn: 'অনিয়মিত চতুর্ভুজ' },
    FREEFORM: { en: 'Custom Canvas Polygon', bn: 'কাস্টম ক্যানভাস ড্রয়িং' },
  };

  const currentShapeTitle =
    lang === 'BN' ? shapeTitleMap[shape]?.bn || shape : shapeTitleMap[shape]?.en || shape;

  // Build inputs summary list
  const getInputItems = (): { label: string; value: string }[] => {
    const list: { label: string; value: string }[] = [];

    if (shape === 'RECTANGLE') {
      if (inputs.length_1) list.push({ label: lang === 'BN' ? 'উত্তর বাহু (দৈর্ঘ্য ১)' : 'Length 1 (North)', value: `${inputs.length_1} ${unitLabel}` });
      if (inputs.length_2) list.push({ label: lang === 'BN' ? 'দক্ষিণ বাহু (দৈর্ঘ্য ২)' : 'Length 2 (South)', value: `${inputs.length_2} ${unitLabel}` });
      if (inputs.width_1) list.push({ label: lang === 'BN' ? 'পশ্চিম বাহু (প্রস্থ ১)' : 'Width 1 (West)', value: `${inputs.width_1} ${unitLabel}` });
      if (inputs.width_2) list.push({ label: lang === 'BN' ? 'পূর্ব বাহু (প্রস্থ ২)' : 'Width 2 (East)', value: `${inputs.width_2} ${unitLabel}` });
    } else if (shape === 'TRIANGLE') {
      if (triangleMethod === 'BASE_HEIGHT') {
        if (inputs.base) list.push({ label: lang === 'BN' ? 'ভূমি (Base)' : 'Base', value: `${inputs.base} ${unitLabel}` });
        if (inputs.height) list.push({ label: lang === 'BN' ? 'উচ্চতা (Height)' : 'Height', value: `${inputs.height} ${unitLabel}` });
      } else {
        if (inputs.side_a) list.push({ label: lang === 'BN' ? 'বাহু ক (A)' : 'Side A', value: `${inputs.side_a} ${unitLabel}` });
        if (inputs.side_b) list.push({ label: lang === 'BN' ? 'বাহু খ (B)' : 'Side B', value: `${inputs.side_b} ${unitLabel}` });
        if (inputs.side_c) list.push({ label: lang === 'BN' ? 'বাহু গ (C)' : 'Side C', value: `${inputs.side_c} ${unitLabel}` });
      }
    } else if (shape === 'QUADRILATERAL') {
      if (inputs.side_a) list.push({ label: lang === 'BN' ? 'বাহু ক (A)' : 'Side A', value: `${inputs.side_a} ${unitLabel}` });
      if (inputs.side_b) list.push({ label: lang === 'BN' ? 'বাহু খ (B)' : 'Side B', value: `${inputs.side_b} ${unitLabel}` });
      if (inputs.side_c) list.push({ label: lang === 'BN' ? 'বাহু গ (C)' : 'Side C', value: `${inputs.side_c} ${unitLabel}` });
      if (inputs.side_d) list.push({ label: lang === 'BN' ? 'বাহু ঘ (D)' : 'Side D', value: `${inputs.side_d} ${unitLabel}` });
      if (inputs.diag_e) list.push({ label: lang === 'BN' ? 'কর্ণ (Diagonal E)' : 'Diagonal E', value: `${inputs.diag_e} ${unitLabel}` });
    } else if (shape === 'PENTAGON') {
      ['side_1', 'side_2', 'side_3', 'side_4', 'side_5'].forEach((k, i) => {
        if (inputs[k]) list.push({ label: lang === 'BN' ? `বাহু ${toBengaliNumerals(i + 1)}` : `Side ${i + 1}`, value: `${inputs[k]} ${unitLabel}` });
      });
      if (inputs.diag_1_pent) list.push({ label: lang === 'BN' ? 'কর্ণ ১' : 'Diagonal 1', value: `${inputs.diag_1_pent} ${unitLabel}` });
      if (inputs.diag_2_pent) list.push({ label: lang === 'BN' ? 'কর্ণ ২' : 'Diagonal 2', value: `${inputs.diag_2_pent} ${unitLabel}` });
    } else if (shape === 'HEXAGON') {
      if (inputs.side) list.push({ label: lang === 'BN' ? 'প্রতি বাহু' : 'Side Length', value: `${inputs.side} ${unitLabel}` });
    } else if (shape === 'FREEFORM') {
      list.push({
        label: lang === 'BN' ? 'মোট সীমানা পয়েন্ট' : 'Total Boundary Pins',
        value: `${freeformPoints?.length || 0} ${lang === 'BN' ? 'টি' : 'pins'}`,
      });
    }

    return list;
  };

  const inputItems = getInputItems();

  // Total Land Valuation
  const calculatedTotalPrice = computeTotalPrice(result, landPrice, priceUnit);
  const priceUnitLabel =
    priceUnit === 'KATHA'
      ? lang === 'BN'
        ? 'কাঠা'
        : 'Katha'
      : priceUnit === 'BIGHA'
      ? lang === 'BN'
        ? 'বিঘা'
        : 'Bigha'
      : lang === 'BN'
      ? 'শতাংশ / শতক'
      : 'Sotangso';

  // Copy full summary to clipboard
  const handleCopy = () => {
    sound.playClick();
    const textLines = [
      `==============================`,
      `  ${lang === 'BN' ? 'ভূমি পরিমাপের পূর্ণাঙ্গ হিসাব' : 'Land Survey Measurement Summary'}`,
      `==============================`,
      `${lang === 'BN' ? 'জমির আকার:' : 'Shape:'} ${currentShapeTitle}`,
      `${lang === 'BN' ? 'ব্যবহৃত একক:' : 'Unit:'} ${unit === 'FEET' ? 'Feet (ফুট)' : 'Meters (মিটার)'}`,
      ``,
      `${lang === 'BN' ? 'প্রদত্ত পরিমাপসমূহ:' : 'Input Dimensions:'}`,
      ...inputItems.map((item) => `• ${item.label}: ${item.value}`),
      ``,
      `--- ${lang === 'BN' ? 'জমির ক্ষেত্রফল (বাংলাদেশ স্ট্যান্ডার্ড)' : 'Land Area Metrics'} ---`,
      `• ${lang === 'BN' ? 'শতাংশ / শতক:' : 'Sotangso / Decimal:'} ${result.sotangso.toFixed(4)}`,
      `• ${lang === 'BN' ? 'কাঠা:' : 'Katha:'} ${result.katha.toFixed(4)} (${lang === 'BN' ? `১ কাঠা = ${sotangsoPerKatha.toFixed(2)} শতক` : `1 Katha = ${sotangsoPerKatha.toFixed(2)} Decimals`})`,
      `• ${lang === 'BN' ? 'বিঘা:' : 'Bigha:'} ${result.bigha.toFixed(4)}`,
      `• ${lang === 'BN' ? 'একর:' : 'Acre:'} ${result.acre.toFixed(4)}`,
      `• ${lang === 'BN' ? 'মোট বর্গফুট:' : 'Sq. Feet:'} ${result.sqFeet.toFixed(2)}`,
      `• ${lang === 'BN' ? 'মোট বর্গমিটার:' : 'Sq. Meters:'} ${result.sqMeters.toFixed(2)}`,
      `• ${lang === 'BN' ? 'ছটাক:' : 'Chhatak:'} ${(result.chhatak || 0).toFixed(2)}`,
      `• ${lang === 'BN' ? 'হেক্টর:' : 'Hectare:'} ${(result.hectare || 0).toFixed(4)}`,
      ``,
    ];

    if (landPrice > 0) {
      textLines.push(
        `--- ${lang === 'BN' ? 'আনুমানিক বাজার মূল্য' : 'Estimated Market Valuation'} ---`,
        `• ${lang === 'BN' ? 'রেট:' : 'Rate:'} ৳ ${landPrice.toLocaleString()} ${lang === 'BN' ? `প্রতি ${priceUnitLabel}` : `per ${priceUnitLabel}`}`,
        `• ${lang === 'BN' ? 'মোট আনুমানিক মূল্য:' : 'Total Value:'} ${formatBDT(calculatedTotalPrice)}`,
        ``
      );
    }

    textLines.push(
      `------------------------------`,
      `Calculated via Jomi Porimap Total Station`,
      `https://rubayetkhan.is-best.net`
    );

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
      >
        <SkeuoCard showScrews style={{ padding: '24px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid var(--border-rim)',
              paddingBottom: '14px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)',
                }}
              >
                <Award size={24} />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#1B5E20',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{getTranslation('calc_result_modal_title', lang)}</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span
                    style={{
                      background: 'rgba(46, 125, 50, 0.12)',
                      color: '#1B5E20',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    📐 {currentShapeTitle}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    • {unit === 'FEET' ? (lang === 'BN' ? 'ফুট ভিত্তিক' : 'Feet Base') : (lang === 'BN' ? 'মিটার ভিত্তিক' : 'Meters Base')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={22} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Input Dimensions Summary Bar */}
            {inputItems.length > 0 && (
              <div
                style={{
                  background: 'var(--surface-plate)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-rim)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  {getTranslation('input_summary', lang)}:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {inputItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--surface-top)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-rim)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
                      <strong style={{ fontSize: '13px', color: '#1B5E20' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Spotlight Card: Sotangso / Decimal */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1B5E20 0%, #0D3E13 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(27, 94, 32, 0.35)',
                border: '1.5px solid rgba(78, 250, 138, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#A5D6A7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={16} color="#4EFA8A" />
                  <span>{getTranslation('sotangso', lang)}</span>
                </div>
                <div
                  style={{
                    fontSize: 'clamp(28px, 6vw, 38px)',
                    fontWeight: 900,
                    fontFamily: 'Outfit, Hind Siliguri, monospace',
                    letterSpacing: '-0.5px',
                    color: '#4EFA8A',
                    lineHeight: 1.1,
                    marginTop: '4px',
                    textShadow: '0 0 16px rgba(78, 250, 138, 0.4)',
                  }}
                >
                  {fmt(result.sotangso, 4)}
                </div>
                <div style={{ fontSize: '12px', color: '#C8E6C9', marginTop: '2px' }}>
                  {lang === 'BN' ? '১ শতাংশ = ৪৩৫.৬০ বর্গফুট' : '1 Sotangso = 435.60 Sq.Ft'}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(4px)',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '11px', color: '#A5D6A7', fontWeight: 700 }}>
                  {getTranslation('katha', lang)}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    fontFamily: 'Outfit, sans-serif',
                    color: '#FFFFFF',
                  }}
                >
                  {fmt(result.katha, 3)}
                </div>
                <div style={{ fontSize: '10px', color: '#C8E6C9' }}>
                  {lang === 'BN'
                    ? `(১ কাঠা = ${toBengaliNumerals(sotangsoPerKatha.toFixed(2))} শতক)`
                    : `(1 Katha = ${sotangsoPerKatha.toFixed(2)} Decimals)`}
                </div>
              </div>
            </div>

            {/* Core Units Grid (Bigha, Acre, Sq.Ft, Sq.M) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Bigha */}
              <div
                style={{
                  background: 'var(--surface-top)',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-rim)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  🌾 {getTranslation('bigha', lang)}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                  {fmt(result.bigha, 4)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {lang === 'BN' ? '২০ কাঠা / ৩৩.০৬ শতক' : '20 Katha / 33.06 Dec.'}
                </div>
              </div>

              {/* Acre */}
              <div
                style={{
                  background: 'var(--surface-top)',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-rim)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  🏞️ {getTranslation('acre', lang)}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px' }}>
                  {fmt(result.acre, 4)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {lang === 'BN' ? '১০০ শতক / ৩.০২৫ বিঘা' : '100 Decimals / 3.025 Bigha'}
                </div>
              </div>

              {/* Total Sq. Feet */}
              <div
                style={{
                  background: 'var(--surface-top)',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-rim)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  📏 {getTranslation('sq_feet', lang)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#1B5E20', marginTop: '4px' }}>
                  {fmtInt(result.sqFeet)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {lang === 'BN' ? 'মোট বর্গফুট' : 'Square Feet'}
                </div>
              </div>

              {/* Total Sq. Meters */}
              <div
                style={{
                  background: 'var(--surface-top)',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-rim)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  🌐 {getTranslation('sq_meters', lang)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#1B5E20', marginTop: '4px' }}>
                  {fmtInt(result.sqMeters)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {lang === 'BN' ? 'মোট বর্গমিটার' : 'Square Meters'}
                </div>
              </div>
            </div>

            {/* Traditional units: Chhatak & Hectare */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                background: 'var(--surface-plate)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-rim)',
                fontSize: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: '130px' }}>
                <span style={{ color: 'var(--text-muted)' }}>📐 {getTranslation('chhatak', lang)}: </span>
                <strong style={{ color: 'var(--text-main)' }}>{fmt(result.chhatak, 2)}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> (১৬ ছটাক = ১ কাঠা)</span>
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <span style={{ color: 'var(--text-muted)' }}>🗺️ {getTranslation('hectare', lang)}: </span>
                <strong style={{ color: 'var(--text-main)' }}>{fmt(result.hectare, 4)}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> (২.৪৭ একর)</span>
              </div>
            </div>

            {/* Land Price / Financial Valuation Card */}
            {landPrice > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  border: '1.5px solid #FFD54F',
                  boxShadow: '0 4px 14px rgba(255, 179, 0, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#B78103',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Coins size={16} />
                    <span>{getTranslation('total_market_value', lang)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(22px, 5vw, 28px)',
                      fontWeight: 900,
                      color: '#6D4C41',
                      marginTop: '4px',
                    }}
                  >
                    {formatBDT(calculatedTotalPrice)}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(215, 160, 0, 0.3)',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#8D6E63' }}>
                    {getTranslation('applied_rate', lang)}:
                  </div>
                  <strong style={{ fontSize: '14px', color: '#4E342E' }}>
                    ৳ {landPrice.toLocaleString()} / {priceUnitLabel}
                  </strong>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleCopy}
                className="rocker-btn active-feet"
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                <span>{copied ? (lang === 'BN' ? 'কপি হয়েছে!' : 'Copied!') : getTranslation('copy_results', lang)}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="rocker-btn"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-rim)',
                  background: 'var(--surface-top)',
                  color: 'var(--text-main)',
                }}
              >
                <Printer size={18} />
                <span>{getTranslation('print_receipt', lang)}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rocker-btn"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: '1px solid var(--border-rim)',
                  background: 'var(--surface-plate)',
                  color: 'var(--text-muted)',
                }}
              >
                {getTranslation('close', lang)}
              </button>
            </div>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
