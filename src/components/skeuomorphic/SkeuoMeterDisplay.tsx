import React from 'react';
import { RotateCcw, Copy, Check, Radio } from 'lucide-react';
import { AppLanguage, AppUnit, CalculationResult } from '../../types';
import { formatNumber } from '../../lib/calculations';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface SkeuoMeterDisplayProps {
  result: CalculationResult;
  unit: AppUnit;
  lang: AppLanguage;
  onReset?: () => void;
  titleBadge?: string;
  isCube?: boolean;
}

export const SkeuoMeterDisplay: React.FC<SkeuoMeterDisplayProps> = ({
  result,
  unit,
  lang,
  onReset,
  titleBadge = 'TOTAL STATION',
  isCube = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isFeet = unit === 'FEET';

  const primaryVal = isFeet ? result.sqFeet : result.sqMeters;
  const secondaryVal = isFeet ? result.sqMeters : result.sqFeet;

  const handleReset = () => {
    sound.playReset();
    if (onReset) onReset();
  };

  const handleCopy = () => {
    sound.playClick();
    const textToCopy = `[জমি পরিমাপ ফলাফল / Land Survey Result]
• ${isFeet ? 'বর্গফুট (Sq.Ft)' : 'বর্গমিটার (Sq.M)'}: ${formatNumber(primaryVal, 2)}
• ${isFeet ? 'বর্গমিটার (Sq.M)' : 'বর্গফুট (Sq.Ft)'}: ${formatNumber(secondaryVal, 2)}
• শতাংশ (Sotangso): ${result.sotangso.toFixed(4)}
• কাঠা (Katha): ${result.katha.toFixed(3)}
• বিঘা (Bigha): ${result.bigha.toFixed(4)}
• একর (Acre): ${result.acre.toFixed(4)}
${result.cubeVolume ? `• মাটির আয়তন (CFT): ${formatNumber(result.cubeVolume, 2)}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4EFA8A', '#FFD166', '#64B5F6', '#388E3C'],
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <div className="lcd-display-container">
      <div className="lcd-screen">
        {/* Top Status & Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(78, 250, 138, 0.18)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.8px',
            color: 'var(--lcd-label-mint)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="animate-pulse"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--lcd-digit-green)',
                display: 'inline-block',
                boxShadow: '0 0 8px #4EFA8A',
              }}
            />
            <span style={{ textTransform: 'uppercase' }}>
              {isFeet
                ? lang === 'BN'
                  ? 'প্রাথমিক: বর্গফুট (SQ. FEET)'
                  : 'PRIMARY: SQ. FEET'
                : lang === 'BN'
                ? 'প্রাথমিক: বর্গমিটার (SQ. METERS)'
                : 'PRIMARY: SQ. METERS'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(78, 250, 138, 0.12)',
                color: 'var(--lcd-digit-green)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 900,
                border: '1px solid rgba(78, 250, 138, 0.3)',
              }}
            >
              <Radio size={10} />
              {titleBadge}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title={lang === 'BN' ? 'ফলাফল কপি করুন' : 'Copy Results'}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(78, 250, 138, 0.3)',
                color: copied ? '#4EFA8A' : '#81C784',
                borderRadius: '6px',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>

            {onReset && (
              <button
                type="button"
                onClick={handleReset}
                title={lang === 'BN' ? 'রিসেট করুন' : 'Reset Instrument'}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#81C784',
                  borderRadius: '6px',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Primary Glowing Numbers & Secondary Measurement */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            margin: '14px 0 16px 0',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#81C784',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '2px',
              }}
            >
              {isFeet ? 'TOTAL SQUARE FEET' : 'TOTAL SQUARE METERS'}
            </div>
            <div
              className="lcd-green-glow font-digital"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '1px',
              }}
            >
              {formatNumber(primaryVal, 2)}
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: '110px' }}>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: '2px',
              }}
            >
              {isFeet
                ? lang === 'BN'
                  ? 'বর্গমিটার (SQ.M)'
                  : 'SQ. METERS'
                : lang === 'BN'
                ? 'বর্গফুট (SQ.FT)'
                : 'SQ. FEET'}
            </div>
            <div
              className="lcd-amber-glow font-digital"
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {formatNumber(secondaryVal, 2)}
            </div>
          </div>
        </div>

        {/* Special Cube Volume Display if Cube is selected */}
        {isCube && result.cubeVolume !== undefined && (
          <div
            style={{
              background: 'rgba(78, 250, 138, 0.08)',
              border: '1px solid rgba(78, 250, 138, 0.25)',
              borderRadius: '10px',
              padding: '8px 12px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#81C784' }}>
              ⛏️ {lang === 'BN' ? 'মাটিকাটার মোট আয়তন (Volume)' : 'Excavation Volume (CFT / m³)'}:
            </div>
            <div
              className="lcd-cyan-glow font-digital"
              style={{ fontSize: '1.3rem', fontWeight: 800 }}
            >
              {formatNumber(result.cubeVolume, 2)} {isFeet ? 'CFT' : 'm³'}
            </div>
          </div>
        )}

        {/* 4 Traditional Bangladesh Land Gauges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(78, 250, 138, 0.18)',
            textAlign: 'center',
          }}
        >
          {/* Sotangso */}
          <div
            style={{
              padding: '6px 4px',
              borderRadius: '8px',
              background: 'rgba(255, 110, 110, 0.06)',
              border: '1px solid rgba(255, 110, 110, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '4px',
              }}
            >
              {lang === 'BN' ? 'শতাংশ / শতক' : 'SOTANGSO'}
            </div>
            <div
              className="lcd-red-glow font-digital"
              style={{ fontSize: '1rem', fontWeight: 900 }}
            >
              {result.sotangso.toFixed(4)}
            </div>
          </div>

          {/* Katha */}
          <div
            style={{
              padding: '6px 4px',
              borderRadius: '8px',
              background: 'rgba(255, 209, 102, 0.06)',
              border: '1px solid rgba(255, 209, 102, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '4px',
              }}
            >
              {lang === 'BN' ? 'কাঠা' : 'KATHA'}
            </div>
            <div
              className="lcd-amber-glow font-digital"
              style={{ fontSize: '1rem', fontWeight: 900 }}
            >
              {result.katha.toFixed(3)}
            </div>
          </div>

          {/* Bigha */}
          <div
            style={{
              padding: '6px 4px',
              borderRadius: '8px',
              background: 'rgba(100, 181, 246, 0.06)',
              border: '1px solid rgba(100, 181, 246, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '4px',
              }}
            >
              {lang === 'BN' ? 'বিঘা' : 'BIGHA'}
            </div>
            <div
              className="lcd-cyan-glow font-digital"
              style={{ fontSize: '1rem', fontWeight: 900 }}
            >
              {result.bigha.toFixed(4)}
            </div>
          </div>

          {/* Acre */}
          <div
            style={{
              padding: '6px 4px',
              borderRadius: '8px',
              background: 'rgba(78, 250, 138, 0.06)',
              border: '1px solid rgba(78, 250, 138, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '4px',
              }}
            >
              {lang === 'BN' ? 'একর' : 'ACRE'}
            </div>
            <div
              className="lcd-green-glow font-digital"
              style={{ fontSize: '1rem', fontWeight: 900 }}
            >
              {result.acre.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
