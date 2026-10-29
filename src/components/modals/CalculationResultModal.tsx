import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Award,
  Sparkles,
  Coins,
  FileDown,
  Image as ImageIcon,
  FileText,
  Layers,
  ChevronRight,
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
import { sound } from '../../lib/sound';

export interface CalculationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  shape: LandShape | 'KHATIAN' | 'TRIANGULATION' | string;
  inputs: Record<string, string>;
  unit: AppUnit;
  triangleMethod?: TriangleMethod;
  freeformPoints?: CanvasPoint[];
  landPrice: number;
  priceUnit: PriceUnit;
  sotangsoPerKatha: number;
  lang: AppLanguage;
  onOpenCertificatePage: (action?: 'PRINT' | 'PDF' | 'JPG') => void;
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
  onOpenCertificatePage,
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

  const shapeTitleMap: Record<string, { en: string; bn: string }> = {
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
    KHATIAN: { en: 'Khatian Land Assessment', bn: 'খতিয়ান হিস্যা ও বণ্টন' },
    TRIANGULATION: { en: 'Triangulation Survey', bn: 'ত্রিভুজায়ন জরিপ' },
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

    if (list.length === 0) {
      if (inputs.description) {
        list.push({
          label: lang === 'BN' ? 'পরিমাপ বিবরণ' : 'Measurement Info',
          value: inputs.description,
        });
      } else {
        Object.entries(inputs).forEach(([k, v]) => {
          if (v && v !== '0') {
            list.push({ label: k, value: String(v) });
          }
        });
      }
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
      `  ${lang === 'BN' ? 'ভূমি পরিমাপের হিসাব বিবরণী' : 'Land Survey Calculation Summary'}`,
      `==============================`,
      `${lang === 'BN' ? 'জমির আকার:' : 'Shape:'} ${currentShapeTitle}`,
      `${lang === 'BN' ? 'একক:' : 'Unit:'} ${unit === 'FEET' ? 'Feet (ফুট)' : 'Meters (মিটার)'}`,
      ``,
      `${lang === 'BN' ? 'পরিমাপসমূহ:' : 'Dimensions:'}`,
      ...inputItems.map((item) => `• ${item.label}: ${item.value}`),
      ``,
      `--- ${lang === 'BN' ? 'জমির ক্ষেত্রফল' : 'Land Area Metrics'} ---`,
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
        `--- ${lang === 'BN' ? 'বাজার মূল্য' : 'Estimated Value'} ---`,
        `• ${lang === 'BN' ? 'রেট:' : 'Rate:'} ৳ ${landPrice.toLocaleString()} / ${priceUnitLabel}`,
        `• ${lang === 'BN' ? 'মোট মূল্য:' : 'Total Value:'} ${formatBDT(calculatedTotalPrice)}`,
        ``
      );
    }

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ padding: '16px 8px' }}>
      <div
        className="modal-content result-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
        }}
      >
        <SkeuoCard className="result-modal-card" style={{ padding: '22px' }}>
          {/* Top Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid var(--border-rim)',
              paddingBottom: '14px',
              marginBottom: '18px',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Award size={20} />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  {getTranslation('calc_result_modal_title', lang)}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669',
                      padding: '1px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    📐 {currentShapeTitle}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    • {unit === 'FEET' ? (lang === 'BN' ? 'ফুট ভিত্তিক' : 'Feet Base') : (lang === 'BN' ? 'মিটার ভিত্তিক' : 'Meters Base')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="header-glass-btn modal-close-btn"
              style={{ height: '34px', width: '34px', padding: 0 }}
              title={lang === 'BN' ? 'বন্ধ করুন' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>

          {/* 1. Given Measurement Inputs Summary */}
          {inputItems.length > 0 && (
            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-rim)',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '8px',
                }}
              >
                {getTranslation('input_summary', lang)}:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{item.label}</span>
                    <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Primary Spotlight Card: Sotangso / Decimal & Katha */}
          <div
            style={{
              background: 'linear-gradient(135deg, #064E3B 0%, #022c22 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1.5px solid #10B981',
              boxShadow: '0 8px 24px rgba(6, 78, 59, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={16} color="#34D399" />
                <span>{getTranslation('sotangso', lang)} (শতাংশ / শতক / ডেসিমেল)</span>
              </div>
              <div
                style={{
                  fontSize: 'clamp(28px, 6vw, 36px)',
                  fontWeight: 900,
                  fontFamily: 'Outfit, Hind Siliguri, monospace',
                  letterSpacing: '-0.5px',
                  color: '#34D399',
                  lineHeight: 1.15,
                  marginTop: '2px',
                }}
              >
                {fmt(result.sotangso, 4)}
              </div>
              <div style={{ fontSize: '11px', color: '#D1FAE5', marginTop: '3px' }}>
                {lang === 'BN' ? '১ শতাংশ = ৪৩৫.৬০ বর্গফুট (বর্গমিটার ৪০.৪৬)' : '1 Sotangso = 435.60 Sq.Ft'}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '11.5px', color: '#A7F3D0', fontWeight: 700 }}>
                {getTranslation('katha', lang)}
              </div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'Outfit, sans-serif',
                  color: '#FFFFFF',
                }}
              >
                {fmt(result.katha, 3)}
              </div>
              <div style={{ fontSize: '10.5px', color: '#D1FAE5' }}>
                {lang === 'BN'
                  ? `(১ কাঠা = ${toBengaliNumerals(sotangsoPerKatha.toFixed(2))} শতক)`
                  : `(1 Katha = ${sotangsoPerKatha.toFixed(2)} Decimals)`}
              </div>
            </div>
          </div>

          {/* 3. Core Units 2x2 Grid (Bigha, Acre, Sq.Ft, Sq.M) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            {/* Bigha */}
            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-rim)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)' }}>
                🌾 {getTranslation('bigha', lang)}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
                {fmt(result.bigha, 4)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {lang === 'BN' ? '২০ কাঠা / ৩৩.০৬ শতক' : '20 Katha / 33.06 Dec.'}
              </div>
            </div>

            {/* Acre */}
            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-rim)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)' }}>
                🏞️ {getTranslation('acre', lang)}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px' }}>
                {fmt(result.acre, 4)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {lang === 'BN' ? '১০০ শতক / ৩.০২৫ বিঘা' : '100 Decimals / 3.025 Bigha'}
              </div>
            </div>

            {/* Sq. Feet */}
            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-rim)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)' }}>
                📏 {getTranslation('sq_feet', lang)}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857', marginTop: '2px' }}>
                {fmtInt(result.sqFeet)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {lang === 'BN' ? 'মোট বর্গফুট' : 'Square Feet'}
              </div>
            </div>

            {/* Sq. Meters */}
            <div
              style={{
                background: 'var(--surface-plate)',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-rim)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)' }}>
                🌐 {getTranslation('sq_meters', lang)}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857', marginTop: '2px' }}>
                {fmtInt(result.sqMeters)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {lang === 'BN' ? 'মোট বর্গমিটার' : 'Square Meters'}
              </div>
            </div>
          </div>

          {/* 4. Traditional: Chhatak & Hectare */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              background: 'var(--surface-plate)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-rim)',
              fontSize: '11px',
              marginBottom: '14px',
            }}
          >
            <div style={{ flex: 1, minWidth: '120px' }}>
              <span style={{ color: 'var(--text-muted)' }}>📐 {getTranslation('chhatak', lang)}: </span>
              <strong style={{ color: 'var(--text-main)' }}>{fmt(result.chhatak, 2)}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}> (১৬ ছটাক = ১ কাঠা)</span>
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <span style={{ color: 'var(--text-muted)' }}>🗺️ {getTranslation('hectare', lang)}: </span>
              <strong style={{ color: 'var(--text-main)' }}>{fmt(result.hectare, 4)}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}> (২.৪৭ একর)</span>
            </div>
          </div>

          {/* 5. Land Price / Valuation */}
          {landPrice > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.4) 100%)',
                borderRadius: '12px',
                padding: '12px 16px',
                border: '1.5px solid #F59E0B',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '18px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Coins size={15} />
                  <span>{getTranslation('total_market_value', lang)}</span>
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#78350F',
                    marginTop: '2px',
                  }}
                >
                  {formatBDT(calculatedTotalPrice)}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--surface-top)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #FCD34D',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '10px', color: '#92400E' }}>
                  {getTranslation('applied_rate', lang)}:
                </div>
                <strong style={{ fontSize: '12px', color: '#78350F' }}>
                  ৳ {landPrice.toLocaleString()} / {priceUnitLabel}
                </strong>
              </div>
            </div>
          )}

          {/* 6. Action Section: View Full A4 Certificate & Quick Export Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Primary Large Certificate Button */}
            <button
              type="button"
              onClick={() => onOpenCertificatePage()}
              style={{
                width: '100%',
                padding: '13px 18px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <FileText size={18} />
              <span>{lang === 'BN' ? 'পূর্ণাঙ্গ A4 রসিদ ও প্রত্যয়নপত্র পৃষ্ঠা খুলুন' : 'Open Full A4 Certificate Page'}</span>
              <ChevronRight size={18} />
            </button>

            {/* Quick Export Toolbar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onOpenCertificatePage('PRINT')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-rim)',
                  background: 'var(--surface-top)',
                  color: 'var(--text-main)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
                title={lang === 'BN' ? 'A4 পৃষ্ঠায় সরাসরি প্রিন্ট করুন' : 'Print A4'}
              >
                <Printer size={14} />
                <span>{lang === 'BN' ? 'প্রিন্ট' : 'Print'}</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCertificatePage('PDF')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                }}
                title={lang === 'BN' ? 'A4 সাইজে পিডিএফ ডাউনলোড' : 'Download A4 PDF'}
              >
                <FileDown size={14} />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCertificatePage('JPG')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                }}
                title={lang === 'BN' ? 'A4 সাইজে জেপিজি ছবি ডাউনলোড' : 'Download A4 JPG'}
              >
                <ImageIcon size={14} />
                <span>JPG</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '9px 8px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-rim)',
                  background: 'var(--surface-top)',
                  color: copied ? '#059669' : 'var(--text-main)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                <span>{copied ? (lang === 'BN' ? 'কপি' : 'Copied') : (lang === 'BN' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
