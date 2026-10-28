import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  Copy,
  Check,
  Users,
  Scale,
  AlertCircle,
  Calculator,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';
import { AppLanguage, AppUnit, PriceUnit, KhatianPartner } from '../../types';
import { getTranslation } from '../../lib/translations';
import {
  traditionalToDecimalShare,
  formatNumber,
  formatBDT,
  toBengaliNumerals,
  SQ_FT_PER_SOTANGSO,
  SQ_FT_PER_BIGHA,
} from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoUnitRocker } from '../skeuomorphic/SkeuoUnitRocker';
import { KhatianResultModal } from '../modals/KhatianResultModal';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface KhatianTabProps {
  lang: AppLanguage;
  landPrice: number;
  priceUnit?: PriceUnit;
  sotangsoPerKatha: number;
  unit: AppUnit;
  onUnitChange: (unit: AppUnit) => void;
  onSaveHistory: (sotangso: number, desc: string) => void;
}

export const KhatianTab: React.FC<KhatianTabProps> = ({
  lang,
  landPrice,
  priceUnit = 'SOTANGSO',
  sotangsoPerKatha,
  unit,
  onUnitChange,
  onSaveHistory,
}) => {
  // Mode: SINGLE person (Default, exact Image 1) or MULTI partner distribution
  const [calcMode, setCalcMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');

  // Survey Meta States
  const [khatianNo, setKhatianNo] = useState<string>('');
  const [daagNo, setDaagNo] = useState<string>('');
  const [mouza, setMouza] = useState<string>('');

  // Result & Receipt Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);

  // Single Person Share States (Matching Image 1)
  const [singleTotalAcre, setSingleTotalAcre] = useState<string>('');
  const [singlePersonShare, setSinglePersonShare] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [singleCopied, setSingleCopied] = useState<boolean>(false);
  const [singleSaved, setSingleSaved] = useState<boolean>(false);

  // Multi-Partners List
  const [totalLand, setTotalLand] = useState<string>('1.00'); // Default 1.00 Acre or Sotangso
  const [totalLandUnit, setTotalLandUnit] = useState<'ACRE' | 'SOTANGSO'>('ACRE');
  const [shareMode, setShareMode] = useState<'DECIMAL' | 'TRADITIONAL'>('DECIMAL');
  const [multiCopied, setMultiCopied] = useState<boolean>(false);

  const [partners, setPartners] = useState<KhatianPartner[]>([
    {
      id: '1',
      name: lang === 'BN' ? '১ম অংশীদার' : 'Partner 1',
      shareType: 'DECIMAL',
      decimalShare: '0.500',
      ana: '8',
      gonda: '0',
      kara: '0',
      kranti: '0',
      til: '0',
    },
    {
      id: '2',
      name: lang === 'BN' ? '২য় অংশীদার' : 'Partner 2',
      shareType: 'DECIMAL',
      decimalShare: '0.500',
      ana: '8',
      gonda: '0',
      kara: '0',
      kranti: '0',
      til: '0',
    },
  ]);

  // Number formatter helper
  const fmt = (val: number, decimals: number = 4): string => {
    if (isNaN(val)) return '0';
    const s = val.toFixed(decimals).replace(/\.?0+$/, '');
    return lang === 'BN' ? toBengaliNumerals(s || '0') : s || '0';
  };

  // Single Person Calculations
  const parsedTotalAcre = parseFloat(singleTotalAcre) || 0;
  const parsedPersonShare =
    singlePersonShare.trim() !== '' ? parseFloat(singlePersonShare) || 0 : parsedTotalAcre > 0 ? 1.0 : 0;

  // Formula:
  // Land in Acre = Total Acre * Share
  // Land in Sotangso = Land in Acre * 100
  const singlePersonAcre = parsedTotalAcre * parsedPersonShare;
  const singlePersonSotangso = singlePersonAcre * 100.0;
  const singlePersonSqFt = singlePersonSotangso * SQ_FT_PER_SOTANGSO;
  const singlePersonSqM = singlePersonSqFt / 10.7639;
  const singlePersonKatha = singlePersonSotangso / sotangsoPerKatha;
  const singlePersonBigha = singlePersonSqFt / SQ_FT_PER_BIGHA;

  let singlePersonPrice = 0;
  if (landPrice > 0) {
    if (priceUnit === 'SOTANGSO') {
      singlePersonPrice = singlePersonSotangso * landPrice;
    } else if (priceUnit === 'KATHA') {
      singlePersonPrice = singlePersonKatha * landPrice;
    } else {
      singlePersonPrice = singlePersonBigha * landPrice;
    }
  }

  const handleCalculateSingle = () => {
    sound.playBeep();
    setHasCalculated(true);
    setIsResultModalOpen(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
      });
    } catch {
      // fallback
    }
  };

  const handleCopySingle = () => {
    sound.playClick();
    let text = `[খতিয়ান থেকে জমির শতাংশ হিসাব / Khatian Share Calculation]\n`;
    text += `মোট জমি: ${singleTotalAcre || '০'} একর\n`;
    text += `ব্যক্তির অংশ: ${singlePersonShare || '০'}\n`;
    text += `---------------------------------\n`;
    text += `প্রাপ্ত জমি (শতাংশ/শতক): ${singlePersonSotangso.toFixed(4)} শতক\n`;
    text += `প্রাপ্ত জমি (কাঠা): ${singlePersonKatha.toFixed(3)} কাঠা\n`;
    text += `প্রাপ্ত জমি (বিঘা): ${singlePersonBigha.toFixed(4)} বিঘা\n`;
    text += `প্রাপ্ত জমি (একর): ${singlePersonAcre.toFixed(4)} একর\n`;
    text += `বর্গফুট: ${formatNumber(singlePersonSqFt, 1)} Sq.Ft\n`;
    text += `বর্গমিটার: ${formatNumber(singlePersonSqM, 1)} Sq.M\n`;
    if (landPrice > 0) {
      text += `আনুমানিক বাজার মূল্য: ${formatBDT(singlePersonPrice)}\n`;
    }

    navigator.clipboard.writeText(text);
    setSingleCopied(true);
    setTimeout(() => setSingleCopied(false), 2000);
  };

  const handlePrintSingle = () => {
    sound.playClick();
    setIsResultModalOpen(true);
  };

  const handleSaveSingle = () => {
    sound.playClick();
    onSaveHistory(
      singlePersonSotangso,
      `Khatian: Total ${singleTotalAcre} Acre, Share ${singlePersonShare} -> ${singlePersonSotangso.toFixed(4)} Sotangso`
    );
    setSingleSaved(true);
    setTimeout(() => setSingleSaved(false), 2000);
  };

  // Convert total land to Sotangso for Multi-Mode
  const totalLandNum = parseFloat(totalLand) || 0;
  const totalSotangso = totalLandUnit === 'ACRE' ? totalLandNum * 100.0 : totalLandNum;

  // Compute each partner's share in Multi-Mode
  const partnerResults = partners.map((p) => {
    let shareRatio = 0;
    if (shareMode === 'DECIMAL') {
      shareRatio = parseFloat(p.decimalShare) || 0;
    } else {
      const ana = parseFloat(p.ana) || 0;
      const gonda = parseFloat(p.gonda) || 0;
      const kara = parseFloat(p.kara) || 0;
      const kranti = parseFloat(p.kranti) || 0;
      const til = parseFloat(p.til) || 0;
      shareRatio = traditionalToDecimalShare(ana, gonda, kara, kranti, til);
    }

    const pSotangso = totalSotangso * shareRatio;
    const pSqFt = pSotangso * SQ_FT_PER_SOTANGSO;
    const pKatha = pSotangso / sotangsoPerKatha;
    const pBigha = pSqFt / SQ_FT_PER_BIGHA;
    const pPrice = pSotangso * landPrice;

    return {
      ...p,
      shareRatio,
      sotangso: pSotangso,
      sqFeet: pSqFt,
      katha: pKatha,
      bigha: pBigha,
      price: pPrice,
    };
  });

  const totalShareAllocated = partnerResults.reduce((sum, p) => sum + (p.shareRatio || 0), 0);
  const remainingShare = 1.0 - totalShareAllocated;

  const handleAddPartner = () => {
    sound.playClick();
    const newPartner: KhatianPartner = {
      id: String(Date.now()),
      name: `${lang === 'BN' ? 'অংশীদার' : 'Partner'} ${partners.length + 1}`,
      shareType: shareMode,
      decimalShare: '0.000',
      ana: '0',
      gonda: '0',
      kara: '0',
      kranti: '0',
      til: '0',
    };
    setPartners([...partners, newPartner]);
  };

  const handleRemovePartner = (id: string) => {
    if (partners.length <= 1) return;
    sound.playClick();
    setPartners(partners.filter((p) => p.id !== id));
  };

  const handleUpdatePartner = (id: string, updates: Partial<KhatianPartner>) => {
    setPartners(partners.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handlePrintMulti = () => {
    sound.playClick();
    setIsResultModalOpen(true);
  };

  const handleCopyMulti = () => {
    sound.playClick();
    let text = `[খতিয়ান হিস্যা বণ্টন ফলাফল / Khatian Share Report]\n`;
    text += `মোট জমি: ${totalLand} ${totalLandUnit === 'ACRE' ? 'একর' : 'শতাংশ'} (${totalSotangso.toFixed(2)} শতক)\n`;
    text += `মোট অংশীদার: ${partners.length} জন\n---------------------------\n`;

    partnerResults.forEach((p, i) => {
      text += `${i + 1}. ${p.name}: হিস্যা ${((p.shareRatio || 0) * 100).toFixed(2)}%\n`;
      text += `   • শতাংশ: ${(p.sotangso || 0).toFixed(4)}\n`;
      text += `   • কাঠা: ${(p.katha || 0).toFixed(3)}\n`;
      text += `   • বর্গফুট: ${formatNumber(p.sqFeet || 0, 1)}\n`;
      if (landPrice > 0) {
        text += `   • আনুমানিক মূল্য: ${formatBDT(p.price || 0)}\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setMultiCopied(true);
    setTimeout(() => setMultiCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      {/* 1. Unit Rocker (ফুট FT ⇄ মিটার M) - As shown at top of Image 1 */}
      <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%' }}>
        <SkeuoUnitRocker unit={unit} onUnitChange={onUnitChange} lang={lang} />
      </div>

      {/* 2. Main Single Person Calculator Card (Matching Image 1 Exactly) */}
      {calcMode === 'SINGLE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkeuoCard
            style={{
              padding: '28px 24px',
              borderRadius: '24px',
              border: '1.5px solid rgba(46, 125, 50, 0.28)',
              background: 'var(--surface-top)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Header Title with Diamond Icon */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h2
                style={{
                  fontSize: '19px',
                  fontWeight: 900,
                  color: '#1B5E20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '-0.2px',
                }}
              >
                <span style={{ color: '#2E7D32', fontSize: '18px' }}>◆</span>
                <span>{getTranslation('khatian_sotangso_title', lang)}</span>
              </h2>

              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  lineHeight: 1.6,
                  maxWidth: '440px',
                  marginInline: 'auto',
                }}
              >
                {getTranslation('khatian_sotangso_desc', lang)}
              </p>
            </div>

            {/* Inputs & Calculate Button Container */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                maxWidth: '460px',
                marginInline: 'auto',
              }}
            >
              {/* Survey Metadata: Khatian No, Daag No, Mouza */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '6px',
                }}
              >
                <input
                  type="text"
                  value={khatianNo}
                  onChange={(e) => setKhatianNo(e.target.value)}
                  placeholder={lang === 'BN' ? 'খতিয়ান নং (ঐচ্ছিক)' : 'Khatian No (Optional)'}
                  className="skeuo-input"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                />
                <input
                  type="text"
                  value={daagNo}
                  onChange={(e) => setDaagNo(e.target.value)}
                  placeholder={lang === 'BN' ? 'দাগ নং (ঐচ্ছিক)' : 'Daag No (Optional)'}
                  className="skeuo-input"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                />
                <input
                  type="text"
                  value={mouza}
                  onChange={(e) => setMouza(e.target.value)}
                  placeholder={lang === 'BN' ? 'মৌজা (ঐচ্ছিক)' : 'Mouza (Optional)'}
                  className="skeuo-input"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Input 1: খতিয়ানের মোট জমি (একর) */}
              <div>
                <input
                  type="number"
                  step="any"
                  value={singleTotalAcre}
                  onChange={(e) => {
                    setSingleTotalAcre(e.target.value);
                    if (!hasCalculated) setHasCalculated(true);
                  }}
                  placeholder={
                    lang === 'BN' ? 'খতিয়ানের মোট জমি (একর)' : 'Total Land in Khatian (Acre)'
                  }
                  className="skeuo-input"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: '1.5px solid var(--border-rim)',
                    background: 'var(--surface-card)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}
                />
              </div>

              {/* Input 2: ব্যক্তির অংশ (যেমন: ০.০০৭) */}
              <div>
                <input
                  type="number"
                  step="any"
                  value={singlePersonShare}
                  onChange={(e) => {
                    setSinglePersonShare(e.target.value);
                    if (!hasCalculated) setHasCalculated(true);
                  }}
                  placeholder={
                    lang === 'BN' ? 'ব্যক্তির অংশ (ঐচ্ছিক, ডিফল্ট ১.০০০)' : "Person's Share (Optional, e.g. 0.25)"
                  }
                  className="skeuo-input"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 600,
                    border: '1.5px solid var(--border-rim)',
                    background: 'var(--surface-card)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}
                />
              </div>

              {/* Green Calculate Button: ⊞ হিসাব করুন */}
              <button
                type="button"
                onClick={handleCalculateSingle}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1.5px solid #144417',
                  background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #0E3010, 0 6px 14px rgba(27, 94, 32, 0.35)',
                  transition: 'all 0.12s ease',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontSize: '18px' }}>⊞</span>
                <span>{getTranslation('khatian_calculate_btn', lang)}</span>
              </button>
            </div>
          </SkeuoCard>

          {/* Results Display Section (When calculated or input given) */}
          {(hasCalculated || (parsedTotalAcre > 0 && parsedPersonShare > 0)) && (
            <SkeuoCard
              showScrews
              style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'var(--surface-top)',
                border: '1px solid var(--border-rim)',
              }}
            >
              {/* Main Prominent Sotangso Metric */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  background: 'rgba(46, 125, 50, 0.07)',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(46, 125, 50, 0.25)',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {getTranslation('khatian_result_header', lang)}
                </div>

                <div
                  style={{
                    fontSize: '34px',
                    fontWeight: 900,
                    color: '#1B5E20',
                    marginTop: '6px',
                    fontFamily: 'Outfit, Hind Siliguri, sans-serif',
                  }}
                >
                  {fmt(singlePersonSotangso, 4)}{' '}
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#2E7D32' }}>
                    {lang === 'BN' ? 'শতাংশ / শতক' : 'Sotangso (Decimal)'}
                  </span>
                </div>
              </div>

              {/* Units Grid (Katha, Bigha, Acre, Sq.Ft / Sq.M) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    background: 'var(--surface-plate)',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'BN' ? 'কাঠা (Katha)' : 'Katha'}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1B5E20',
                      marginTop: '2px',
                    }}
                  >
                    {fmt(singlePersonKatha, 3)}{' '}
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                      {lang === 'BN' ? 'কাঠা' : ''}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-plate)',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'BN' ? 'বিঘা (Bigha)' : 'Bigha'}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1B5E20',
                      marginTop: '2px',
                    }}
                  >
                    {fmt(singlePersonBigha, 4)}{' '}
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                      {lang === 'BN' ? 'বিঘা' : ''}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-plate)',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'BN' ? 'একর (Acre)' : 'Acre'}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1B5E20',
                      marginTop: '2px',
                    }}
                  >
                    {fmt(singlePersonAcre, 4)}{' '}
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                      {lang === 'BN' ? 'একর' : ''}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-plate)',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {unit === 'FEET'
                      ? lang === 'BN'
                        ? 'বর্গফুট (Sq.Ft)'
                        : 'Sq. Feet'
                      : lang === 'BN'
                      ? 'বর্গমিটার (Sq.M)'
                      : 'Sq. Meters'}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#1B5E20',
                      marginTop: '2px',
                    }}
                  >
                    {fmt(unit === 'FEET' ? singlePersonSqFt : singlePersonSqM, 2)}
                  </div>
                </div>
              </div>

              {/* Price Row (If landPrice is set) */}
              {landPrice > 0 && (
                <div
                  style={{
                    background: 'rgba(46, 125, 50, 0.08)',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(46, 125, 50, 0.25)',
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B5E20' }}>
                    {lang === 'BN' ? 'আনুমানিক বাজার মূল্য:' : 'Estimated Market Value:'}
                  </span>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 900,
                      color: '#2E7D32',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {formatBDT(singlePersonPrice)}
                  </span>
                </div>
              )}

              {/* View Full 1-Page A4 Receipt Modal Button (No formulas, pure calculations) */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsResultModalOpen(true);
                }}
                className="skeuo-btn skeuo-btn-green"
                style={{
                  width: '100%',
                  marginBottom: '16px',
                  padding: '12px 16px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <FileText size={17} />
                <span>
                  {lang === 'BN'
                    ? '📜 পূর্ণাঙ্গ রসিদ ও সার্টিফিকেট দেখুন (প্রিন্ট / PDF / JPG)'
                    : '📜 View Official Receipt (Print / PDF / JPG)'}
                </span>
              </button>

              {/* Action Buttons: Copy, Print, Save to History */}
              <div className="khatian-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCopySingle}
                  className="skeuo-btn skeuo-btn-brass"
                  style={{ padding: '10px 6px', fontSize: '12px' }}
                >
                  {singleCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>
                    {singleCopied
                      ? lang === 'BN'
                        ? 'কপি হয়েছে!'
                        : 'Copied!'
                      : lang === 'BN'
                      ? 'কপি'
                      : 'Copy'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintSingle}
                  className="skeuo-btn skeuo-btn-blue no-print"
                  style={{ padding: '10px 6px', fontSize: '12px' }}
                >
                  <Printer size={14} />
                  <span>{lang === 'BN' ? 'প্রিন্ট' : 'Print'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSingle}
                  className="skeuo-btn skeuo-btn-green"
                  style={{ padding: '10px 6px', fontSize: '12px' }}
                >
                  {singleSaved ? <Check size={14} /> : <Sparkles size={14} />}
                  <span>
                    {singleSaved
                      ? lang === 'BN'
                        ? 'সেভ হয়েছে!'
                        : 'Saved!'
                      : lang === 'BN'
                      ? 'হিস্ট্রিতে সেভ'
                      : 'Save'}
                  </span>
                </button>
              </div>
            </SkeuoCard>
          )}
        </div>
      )}

      {/* 3. Multi-Partner Distribution Mode */}
      {calcMode === 'MULTI' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title & Setup Card */}
          <SkeuoCard style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#1B5E20',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Scale size={20} />
                  <span>{getTranslation('khatian_title', lang)}</span>
                </h2>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    maxWidth: '650px',
                    lineHeight: 1.6,
                  }}
                >
                  {getTranslation('khatian_desc', lang)}
                </p>
              </div>

              {/* Mode Switch (Decimal vs Traditional 16 Ana) */}
              <div
                style={{
                  background: 'var(--surface-plate)',
                  padding: '4px',
                  borderRadius: '12px',
                  display: 'flex',
                  gap: '4px',
                  border: '1px solid var(--border-rim)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    setShareMode('DECIMAL');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background:
                      shareMode === 'DECIMAL'
                        ? 'linear-gradient(180deg, #388E3C 0%, #1B5E20 100%)'
                        : 'transparent',
                    color: shareMode === 'DECIMAL' ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {getTranslation('mode_decimal', lang)}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    setShareMode('TRADITIONAL');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background:
                      shareMode === 'TRADITIONAL'
                        ? 'linear-gradient(180deg, #1E88E5 0%, #0D47A1 100%)'
                        : 'transparent',
                    color: shareMode === 'TRADITIONAL' ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {getTranslation('mode_traditional', lang)}
                </button>
              </div>
            </div>

            {/* Survey Meta Inputs: খতিয়ান নং, দাগ নং, মৌজা */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                marginBottom: '10px',
                paddingTop: '6px',
              }}
            >
              <input
                type="text"
                value={khatianNo}
                onChange={(e) => setKhatianNo(e.target.value)}
                placeholder={lang === 'BN' ? 'খতিয়ান নং (ঐচ্ছিক)' : 'Khatian No (Optional)'}
                className="skeuo-input"
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              />
              <input
                type="text"
                value={daagNo}
                onChange={(e) => setDaagNo(e.target.value)}
                placeholder={lang === 'BN' ? 'দাগ নং (ঐচ্ছিক)' : 'Daag No (Optional)'}
                className="skeuo-input"
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              />
              <input
                type="text"
                value={mouza}
                onChange={(e) => setMouza(e.target.value)}
                placeholder={lang === 'BN' ? 'মৌজা (ঐচ্ছিক)' : 'Mouza (Optional)'}
                className="skeuo-input"
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Total Land Input */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '14px',
                alignItems: 'flex-end',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-rim)',
              }}
            >
              <div style={{ flex: '1 1 200px' }}>
                <label className="field-label">{getTranslation('khatian_total_land', lang)}</label>
                <input
                  type="number"
                  step="any"
                  value={totalLand}
                  onChange={(e) => setTotalLand(e.target.value)}
                  className="skeuo-input"
                  placeholder="e.g. 1.00"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', minWidth: '180px' }}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    setTotalLandUnit('ACRE');
                  }}
                  className={`rocker-btn ${totalLandUnit === 'ACRE' ? 'active-feet' : ''}`}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  {lang === 'BN' ? 'একর (Acre)' : 'Acre'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    setTotalLandUnit('SOTANGSO');
                  }}
                  className={`rocker-btn ${totalLandUnit === 'SOTANGSO' ? 'active-feet' : ''}`}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-rim)',
                  }}
                >
                  {lang === 'BN' ? 'শতাংশ (Sotangso)' : 'Sotangso'}
                </button>
              </div>

              {/* Quick Summary Gauge */}
              <div
                style={{
                  background: 'rgba(46, 125, 50, 0.08)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(46, 125, 50, 0.25)',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#1B5E20',
                  marginLeft: 'auto',
                }}
              >
                {lang === 'BN' ? 'মোট জমি:' : 'Total Equivalent:'}{' '}
                <span style={{ fontSize: '15px', color: '#2E7D32' }}>
                  {totalSotangso.toFixed(2)} {getTranslation('sotangso', lang)}
                </span>{' '}
                ≈ {(totalSotangso / sotangsoPerKatha).toFixed(2)} {getTranslation('katha', lang)}
              </div>
            </div>
          </SkeuoCard>

          {/* Share Allocation Status Meter */}
          <SkeuoCard style={{ padding: '16px 20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{getTranslation('khatian_share_sum', lang)}:</span>
                <span
                  style={{
                    color:
                      Math.abs(totalShareAllocated - 1.0) < 0.0001
                        ? '#2E7D32'
                        : totalShareAllocated > 1.0
                        ? '#D32F2F'
                        : '#E65100',
                    fontSize: '15px',
                    fontFamily: 'Outfit, monospace',
                  }}
                >
                  {(totalShareAllocated * 100).toFixed(2)}% ({totalShareAllocated.toFixed(4)})
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>
                  {getTranslation('khatian_remaining', lang)}:
                </span>{' '}
                <span
                  style={{
                    color: remainingShare < -0.0001 ? '#D32F2F' : '#1B5E20',
                    fontSize: '14px',
                    fontFamily: 'Outfit, monospace',
                  }}
                >
                  {(remainingShare * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '10px',
                background: 'var(--surface-plate)',
                borderRadius: '999px',
                overflow: 'hidden',
                border: '1px solid var(--border-rim)',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, totalShareAllocated * 100))}%`,
                  height: '100%',
                  background:
                    Math.abs(totalShareAllocated - 1.0) < 0.0001
                      ? 'linear-gradient(90deg, #388E3C, #4EFA8A)'
                      : totalShareAllocated > 1.0
                      ? '#D32F2F'
                      : 'linear-gradient(90deg, #1E88E5, #64B5F6)',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>

            {totalShareAllocated > 1.0001 && (
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#D32F2F',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                <AlertCircle size={13} />
                <span>
                  {lang === 'BN'
                    ? 'সতর্কতা: বণ্টিত মোট হিস্যা ১০০% (বা ১.০০০) এর বেশি হয়ে গেছে!'
                    : 'Warning: Total allocated shares exceed 100% (1.000)!'}
                </span>
              </div>
            )}
          </SkeuoCard>

          {/* Partners List & Calculations */}
          <SkeuoCard showScrews style={{ padding: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={18} color="#2E7D32" />
                <span>{getTranslation('khatian_result_title', lang)}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ({partners.length} Partners)
                </span>
              </h3>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="skeuo-btn skeuo-btn-green"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                >
                  <Plus size={14} />
                  <span>{getTranslation('add_partner_btn', lang)}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMulti}
                  className="skeuo-btn skeuo-btn-brass"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                >
                  {multiCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>
                    {multiCopied
                      ? getTranslation('copied_success', lang)
                      : getTranslation('copy_results', lang)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintMulti}
                  className="skeuo-btn skeuo-btn-blue no-print"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                >
                  <Printer size={14} />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Partners Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {partnerResults.map((p, index) => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--surface-plate)',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid var(--border-rim)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Partner Name and Remove */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span
                        style={{
                          background: '#1B5E20',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdatePartner(p.id, { name: e.target.value })}
                        className="skeuo-input"
                        style={{ maxWidth: '240px', padding: '6px 10px', fontSize: '13px' }}
                        placeholder={getTranslation('partner_name', lang)}
                      />
                    </div>

                    {partners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePartner(p.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#D32F2F',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        <Trash2 size={14} />
                        <span>{getTranslation('remove_partner_btn', lang)}</span>
                      </button>
                    )}
                  </div>

                  {/* Share Input based on Mode */}
                  {shareMode === 'DECIMAL' ? (
                    <div>
                      <label className="field-label">
                        {getTranslation('khatian_share', lang)} (0.000 - 1.000)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="1"
                        value={p.decimalShare}
                        onChange={(e) =>
                          handleUpdatePartner(p.id, { decimalShare: e.target.value })
                        }
                        className="skeuo-input"
                        placeholder="e.g. 0.250"
                      />
                    </div>
                  ) : (
                    /* Traditional 16 Ana Inputs */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <label className="field-label">{getTranslation('ana', lang)} (0-16)</label>
                        <input
                          type="number"
                          min="0"
                          max="16"
                          value={p.ana}
                          onChange={(e) => handleUpdatePartner(p.id, { ana: e.target.value })}
                          className="skeuo-input"
                        />
                      </div>
                      <div>
                        <label className="field-label">{getTranslation('gonda', lang)} (0-20)</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={p.gonda}
                          onChange={(e) => handleUpdatePartner(p.id, { gonda: e.target.value })}
                          className="skeuo-input"
                        />
                      </div>
                      <div>
                        <label className="field-label">{getTranslation('kara', lang)} (0-4)</label>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          value={p.kara}
                          onChange={(e) => handleUpdatePartner(p.id, { kara: e.target.value })}
                          className="skeuo-input"
                        />
                      </div>
                      <div>
                        <label className="field-label">{getTranslation('kranti', lang)} (0-3)</label>
                        <input
                          type="number"
                          min="0"
                          max="3"
                          value={p.kranti}
                          onChange={(e) => handleUpdatePartner(p.id, { kranti: e.target.value })}
                          className="skeuo-input"
                        />
                      </div>
                      <div>
                        <label className="field-label">{getTranslation('til', lang)} (0-20)</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={p.til}
                          onChange={(e) => handleUpdatePartner(p.id, { til: e.target.value })}
                          className="skeuo-input"
                        />
                      </div>
                    </div>
                  )}

                  {/* Calculated Land Shares Output Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                      background: 'var(--surface-top)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-rim)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {lang === 'BN' ? 'হিস্যা অনুপাত' : 'Share Ratio'}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#1B5E20',
                          fontFamily: 'Outfit, monospace',
                        }}
                      >
                        {((p.shareRatio || 0) * 100).toFixed(2)}% ({(p.shareRatio || 0).toFixed(4)})
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {getTranslation('sotangso', lang)}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: '#2E7D32',
                          fontFamily: 'Outfit, monospace',
                        }}
                      >
                        {(p.sotangso || 0).toFixed(4)} শতক
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {getTranslation('katha', lang)}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          fontFamily: 'Outfit, monospace',
                        }}
                      >
                        {(p.katha || 0).toFixed(3)} কাঠা
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {getTranslation('sq_feet', lang)}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          fontFamily: 'Outfit, monospace',
                        }}
                      >
                        {formatNumber(p.sqFeet || 0, 1)} sq.ft
                      </div>
                    </div>

                    {landPrice > 0 && (
                      <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed var(--border-rim)', paddingTop: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {lang === 'BN' ? 'আনুমানিক প্রাপ্য মূল্য' : 'Estimated Value'}
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: '#1B5E20',
                            fontFamily: 'Outfit, monospace',
                          }}
                        >
                          {formatBDT(p.price || 0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Full Multi-Partner Receipt & Certificate CTA Button */}
            <button
              type="button"
              onClick={handlePrintMulti}
              className="header-glass-btn no-print"
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '14.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.35)',
                cursor: 'pointer',
              }}
            >
              <FileText size={18} />
              <span>
                {lang === 'BN'
                  ? '📜 পূর্ণাঙ্গ যৌথ বণ্টন রসিদ ও সার্টিফিকেট দেখুন (প্রিন্ট / PDF / JPG)'
                  : '📜 View Full Distribution Receipt (Print / PDF / JPG)'}
              </span>
            </button>
          </SkeuoCard>
        </div>
      )}

      {/* 4. Switch Between Single Share & Multi-Partner Modes */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => {
            sound.playSwitch();
            setCalcMode(calcMode === 'SINGLE' ? 'MULTI' : 'SINGLE');
          }}
          style={{
            background: 'var(--surface-top)',
            border: '1.5px dashed rgba(46, 125, 50, 0.4)',
            padding: '10px 20px',
            borderRadius: '999px',
            color: '#1B5E20',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.15s ease',
          }}
        >
          {calcMode === 'SINGLE' ? <Users size={16} /> : <Layers size={16} />}
          <span>
            {calcMode === 'SINGLE'
              ? lang === 'BN'
                ? 'বহু অংশীদারের হিস্যা বণ্টন মোড দেখুন →'
                : 'Switch to Multi-Partner Share Distribution →'
              : lang === 'BN'
              ? '← একক খতিয়ান শতাংশ ক্যালকুলেটরে ফিরে যান'
              : '← Back to Single Khatian Share Calculator'}
          </span>
        </button>
      </div>

      {/* Khatian Official 1-Page A4 Receipt & Calculation Modal */}
      <KhatianResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        lang={lang}
        mode={calcMode}
        khatianNo={khatianNo}
        daagNo={daagNo}
        mouza={mouza}
        landPrice={landPrice}
        priceUnit={priceUnit}
        sotangsoPerKatha={sotangsoPerKatha}
        singleData={{
          totalAcre: singleTotalAcre,
          personShare: singlePersonShare.trim() !== '' ? singlePersonShare : (parsedTotalAcre > 0 ? '১.০০০ (পূর্ণ অংশ)' : '০'),
          sotangso: singlePersonSotangso,
          katha: singlePersonKatha,
          bigha: singlePersonBigha,
          acre: singlePersonAcre,
          sqFt: singlePersonSqFt,
          sqM: singlePersonSqM,
          price: singlePersonPrice,
        }}
        multiData={{
          totalLand,
          totalLandUnit,
          totalSotangso,
          totalSqFt: totalSotangso * SQ_FT_PER_SOTANGSO,
          totalKatha: totalSotangso / sotangsoPerKatha,
          totalBigha: (totalSotangso * SQ_FT_PER_SOTANGSO) / SQ_FT_PER_BIGHA,
          totalPrice: totalSotangso * landPrice,
          partners: partnerResults,
        }}
      />
    </div>
  );
};
