import React, { useState } from 'react';
import {
  Trash2,
  Copy,
  Check,
  Coins,
  History,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { AppLanguage, CalculationHistoryItem, PriceUnit } from '../../types';
import { getTranslation } from '../../lib/translations';
import { formatBDT, formatNumber } from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { sound } from '../../lib/sound';

interface HistoryTabProps {
  historyList: CalculationHistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  landPrice: number;
  onLandPriceChange: (price: number) => void;
  priceUnit: PriceUnit;
  onPriceUnitChange: (unit: PriceUnit) => void;
  sotangsoPerKatha: number;
  lang: AppLanguage;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  historyList,
  onClearHistory,
  onDeleteHistoryItem,
  landPrice,
  onLandPriceChange,
  priceUnit,
  onPriceUnitChange,
  sotangsoPerKatha,
  lang,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Valuation Calculator Inputs
  const [calcAmount, setCalcAmount] = useState<string>('5.0');
  const [calcLandUnit, setCalcLandUnit] = useState<PriceUnit>('SOTANGSO');
  const [calcUnitPrice, setCalcUnitPrice] = useState<string>(String(landPrice || 50000));
  const [calcPriceUnit, setCalcPriceUnit] = useState<PriceUnit>(priceUnit);

  // Calculate live valuation
  const computePriceValuation = () => {
    const amount = parseFloat(calcAmount) || 0;
    const price = parseFloat(calcUnitPrice) || 0;

    // Convert land amount to Sq.Ft
    const landSqFt =
      calcLandUnit === 'SOTANGSO'
        ? amount * 435.6
        : calcLandUnit === 'KATHA'
        ? amount * sotangsoPerKatha * 435.6
        : amount * 14400.0;

    // Convert price to price per Sq.Ft
    const pricePerSqFt =
      calcPriceUnit === 'SOTANGSO'
        ? price / 435.6
        : calcPriceUnit === 'KATHA'
        ? price / (sotangsoPerKatha * 435.6)
        : price / 14400.0;

    return landSqFt * pricePerSqFt;
  };

  const totalPrice = computePriceValuation();

  const handleApplyGlobalPrice = () => {
    sound.playClick();
    const price = parseFloat(calcUnitPrice) || 0;
    onLandPriceChange(price);
    onPriceUnitChange(calcPriceUnit);
  };

  const handleCopyItem = (item: CalculationHistoryItem) => {
    sound.playClick();
    const txt = `[জমি পরিমাপ হিস্ট্রি / Survey Record]
• আকার/মডিউল: ${item.shapeType} (${item.dateStr})
• পরিমাপ: ${item.inputsDesc}
• ক্ষেত্রফল: ${formatNumber(item.sqFeet, 2)} Sq.Ft (${formatNumber(item.sqMeters, 2)} Sq.M)
• শতাংশ: ${item.sotangso.toFixed(4)}
• কাঠা: ${item.katha.toFixed(3)}
• বিঘা: ${item.bigha.toFixed(4)}
${item.totalPrice ? `• মূল্য: ${formatBDT(item.totalPrice)}` : ''}`;

    navigator.clipboard.writeText(txt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    sound.playReset();
    if (window.confirm(getTranslation('history_clear_confirm', lang))) {
      onClearHistory();
    }
  };

  const unitLabels = {
    SOTANGSO: lang === 'BN' ? 'শতাংশ' : 'Sotangso',
    KATHA: lang === 'BN' ? 'কাঠা' : 'Katha',
    BIGHA: lang === 'BN' ? 'বিঘা' : 'Bigha',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. LAND VALUATION & PRICING CALCULATOR */}
      <SkeuoCard showScrews style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins size={20} color="#D4A017" />
            <span>{getTranslation('price_title', lang)}</span>
          </h2>

          <button
            type="button"
            onClick={handleApplyGlobalPrice}
            className="skeuo-btn skeuo-btn-brass"
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <span>{lang === 'BN' ? 'অ্যাপে রেট সেট করুন' : 'Set as App Rate'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {/* Land Amount */}
          <div>
            <label className="field-label">{getTranslation('land_amount', lang)}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="any"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="skeuo-input"
                style={{ flex: 1 }}
              />
              <select
                value={calcLandUnit}
                onChange={(e) => setCalcLandUnit(e.target.value as PriceUnit)}
                className="skeuo-input"
                style={{ width: '110px' }}
              >
                <option value="SOTANGSO">{unitLabels.SOTANGSO}</option>
                <option value="KATHA">{unitLabels.KATHA}</option>
                <option value="BIGHA">{unitLabels.BIGHA}</option>
              </select>
            </div>
          </div>

          {/* Unit Price */}
          <div>
            <label className="field-label">{getTranslation('unit_price', lang)}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="any"
                value={calcUnitPrice}
                onChange={(e) => setCalcUnitPrice(e.target.value)}
                className="skeuo-input"
                style={{ flex: 1 }}
              />
              <select
                value={calcPriceUnit}
                onChange={(e) => setCalcPriceUnit(e.target.value as PriceUnit)}
                className="skeuo-input"
                style={{ width: '110px' }}
              >
                <option value="SOTANGSO">/{unitLabels.SOTANGSO}</option>
                <option value="KATHA">/{unitLabels.KATHA}</option>
                <option value="BIGHA">/{unitLabels.BIGHA}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculated Total Price Banner */}
        <div
          style={{
            marginTop: '16px',
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)',
            border: '2px solid #81C784',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B5E20' }}>
              {getTranslation('total_price', lang)}:
            </div>
            <div
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                color: '#2E7D32',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {formatBDT(totalPrice)}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#1B5E20', textAlign: 'right' }}>
            <div>{calcAmount} {unitLabels[calcLandUnit]} @ ৳ {formatNumber(parseFloat(calcUnitPrice) || 0, 0)}/{unitLabels[calcPriceUnit]}</div>
            <div style={{ fontWeight: 800 }}>({(totalPrice / (parseFloat(calcAmount) || 1)).toFixed(0)} BDT / Unit)</div>
          </div>
        </div>
      </SkeuoCard>

      {/* 2. SAVED CALCULATION HISTORY */}
      <SkeuoCard showScrews style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#2E7D32" />
            <span>{getTranslation('history_title', lang)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({historyList.length})</span>
          </h2>

          {historyList.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="skeuo-btn skeuo-btn-danger"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <RotateCcw size={14} />
              <span>{getTranslation('history_clear', lang)}</span>
            </button>
          )}
        </div>

        {historyList.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <History size={36} color="var(--border-rim)" />
            <p>{getTranslation('history_empty', lang)}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyList.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--surface-plate)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  border: '1px solid var(--border-rim)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#2E7D32',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 900,
                      }}
                    >
                      {item.shapeType}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{item.dateStr}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyItem(item)}
                      title="Copy item"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedId === item.id ? '#2E7D32' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      title="Delete item"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#D32F2F',
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                  {item.inputsDesc}
                </div>

                {/* Land metrics row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '6px',
                    background: 'var(--surface-top)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-rim)',
                    textAlign: 'center',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Sq.Feet</span>
                    <span style={{ fontWeight: 800, color: '#1B5E20' }}>{formatNumber(item.sqFeet, 1)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>শতাংশ</span>
                    <span style={{ fontWeight: 800, color: '#D32F2F' }}>{item.sotangso.toFixed(4)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>কাঠা</span>
                    <span style={{ fontWeight: 800, color: '#E65100' }}>{item.katha.toFixed(3)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>বিঘা</span>
                    <span style={{ fontWeight: 800, color: '#1976D2' }}>{item.bigha.toFixed(4)}</span>
                  </div>
                  {item.totalPrice ? (
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>মূল্য</span>
                      <span style={{ fontWeight: 800, color: '#2E7D32' }}>{formatBDT(item.totalPrice)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SkeuoCard>
    </div>
  );
};
