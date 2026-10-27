import React, { useState, useEffect } from 'react';
import { Coins, Sparkles, Check, Trash2 } from 'lucide-react';
import { AppLanguage, PriceUnit } from '../../types';
import { getTranslation } from '../../lib/translations';
import { formatBDT, formatNumber } from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';

interface LandValuationCardProps {
  currentSotangso?: number;
  currentKatha?: number;
  currentBigha?: number;
  landPrice: number;
  onLandPriceChange: (price: number) => void;
  priceUnit: PriceUnit;
  onPriceUnitChange: (unit: PriceUnit) => void;
  sotangsoPerKatha: number;
  lang: AppLanguage;
}

export const LandValuationCard: React.FC<LandValuationCardProps> = ({
  currentSotangso = 0,
  landPrice,
  onLandPriceChange,
  priceUnit,
  onPriceUnitChange,
  sotangsoPerKatha,
  lang,
}) => {
  const [calcAmount, setCalcAmount] = useState<string>('5.0');
  const [calcLandUnit, setCalcLandUnit] = useState<PriceUnit>('SOTANGSO');
  const [calcUnitPrice, setCalcUnitPrice] = useState<string>(String(landPrice || 50000));
  const [calcPriceUnit, setCalcPriceUnit] = useState<PriceUnit>(priceUnit);
  const [rateApplied, setRateApplied] = useState(false);

  // Sync if global landPrice or priceUnit changes externally
  useEffect(() => {
    if (landPrice > 0) {
      setCalcUnitPrice(String(landPrice));
    }
  }, [landPrice]);

  useEffect(() => {
    setCalcPriceUnit(priceUnit);
  }, [priceUnit]);

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

  const handleClearValuation = () => {
    sound.playReset();
    setCalcAmount('');
    setCalcUnitPrice('');
  };

  const handleApplyGlobalPrice = () => {
    sound.playClick();
    const price = parseFloat(calcUnitPrice) || 0;
    onLandPriceChange(price);
    onPriceUnitChange(calcPriceUnit);
    setRateApplied(true);
    setTimeout(() => setRateApplied(false), 2500);
  };

  const handleUseCurrentArea = () => {
    sound.playClick();
    if (currentSotangso > 0) {
      setCalcAmount(currentSotangso.toFixed(4));
      setCalcLandUnit('SOTANGSO');
    }
  };

  const unitLabels = {
    SOTANGSO: lang === 'BN' ? 'শতাংশ' : 'Sotangso',
    KATHA: lang === 'BN' ? 'কাঠা' : 'Katha',
    BIGHA: lang === 'BN' ? 'বিঘা' : 'Bigha',
  };

  const numAmount = parseFloat(calcAmount) || 0;
  const numUnitPrice = parseFloat(calcUnitPrice) || 0;

  return (
    <SkeuoCard
      showScrews
      style={{
        padding: '22px',
        borderTop: '3.5px solid #F59E0B',
        boxShadow: '0 12px 28px rgba(245, 158, 11, 0.08), 0 2px 4px var(--bevel-shadow)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.35)',
              flexShrink: 0,
            }}
          >
            <Coins size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#B45309',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '0.3px',
                }}
              >
                {lang === 'BN' ? 'ধাপ ২ : আর্থিক হিসাব' : 'STEP 2 : VALUATION'}
              </span>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#B45309', margin: 0 }}>
                {getTranslation('price_title', lang)}
              </h3>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {lang === 'BN'
                ? 'পরিমাপকৃত জমি বা নির্দিষ্ট পরিমাণের সরাসরি ক্রয়-বিক্রয় মূল্য হিসাব করুন'
                : 'Calculate total purchase or sale price based on land area and unit rate'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Land Amount */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="field-label" style={{ margin: 0 }}>
              {getTranslation('land_amount', lang)}
            </label>
            {currentSotangso > 0 && (
              <button
                type="button"
                onClick={handleUseCurrentArea}
                title={lang === 'BN' ? 'বর্তমান পরিমাপের মান বসান' : 'Fill with current measured area'}
                style={{
                  background: 'rgba(46, 125, 50, 0.1)',
                  border: '1px solid rgba(46, 125, 50, 0.25)',
                  borderRadius: '6px',
                  padding: '2px 7px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1B5E20',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={11} color="#2E7D32" />
                <span>
                  {lang === 'BN'
                    ? `বর্তমান মাপ (${currentSotangso.toFixed(2)} শতক)`
                    : `Use area (${currentSotangso.toFixed(2)} dec)`}
                </span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              step="any"
              placeholder="0.00"
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

        {/* Unit Price (Land Price Unit) */}
        <div>
          <label className="field-label">{getTranslation('unit_price', lang)}</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              step="any"
              placeholder="0"
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

          {/* Action buttons directly under Unit Price */}
          <div
            style={{
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {/* Clear Button */}
            <button
              type="button"
              id="clear-valuation-btn"
              onClick={handleClearValuation}
              className="skeuo-btn"
              title={lang === 'BN' ? 'মূল্যায়ন ঘরগুলো খালি করুন' : 'Clear valuation fields'}
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#DC2626',
                background: 'linear-gradient(180deg, #FEF2F2 0%, #FEE2E2 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.12)',
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} color="#DC2626" />
              <span>{lang === 'BN' ? 'মুছে ফেলুন' : 'Clear'}</span>
            </button>

            {/* Set as App Rate Button */}
            <button
              type="button"
              id="set-app-rate-btn"
              onClick={handleApplyGlobalPrice}
              className="skeuo-btn skeuo-btn-brass"
              title={lang === 'BN' ? 'এই দর অ্যাপের সব জায়গায় সেট করুন' : 'Apply rate across app'}
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)',
              }}
            >
              {rateApplied ? <Check size={13} /> : null}
              <span>
                {rateApplied
                  ? lang === 'BN'
                    ? '✓ রেট সেট হয়েছে!'
                    : '✓ Rate Saved!'
                  : lang === 'BN'
                  ? 'অ্যাপে রেট সেট করুন'
                  : 'Set as App Rate'}
              </span>
            </button>
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
          <div>
            {calcAmount || '0'} {unitLabels[calcLandUnit]} @ ৳{' '}
            {formatNumber(numUnitPrice, 0)}/{unitLabels[calcPriceUnit]}
          </div>
          <div style={{ fontWeight: 800 }}>
            ({numAmount > 0 ? (totalPrice / numAmount).toFixed(0) : '0'} BDT / Unit)
          </div>
        </div>
      </div>
    </SkeuoCard>
  );
};
