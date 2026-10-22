import React, { useState } from 'react';
import { Plus, Trash2, Printer, Copy, Check, Users, Scale, AlertCircle } from 'lucide-react';
import { AppLanguage, KhatianPartner } from '../../types';
import { getTranslation } from '../../lib/translations';
import {
  traditionalToDecimalShare,
  formatNumber,
  formatBDT,
  SQ_FT_PER_SOTANGSO,
  SQ_FT_PER_KATHA,
  SQ_FT_PER_BIGHA,
} from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface KhatianTabProps {
  lang: AppLanguage;
  landPrice: number;
  sotangsoPerKatha: number;
  onSaveHistory: (totalLand: number, partnerCount: number, desc: string) => void;
}

export const KhatianTab: React.FC<KhatianTabProps> = ({
  lang,
  landPrice,
  sotangsoPerKatha,
  onSaveHistory,
}) => {
  const [totalLand, setTotalLand] = useState<string>('1.00'); // Default 1.00 Acre or Sotangso
  const [totalLandUnit, setTotalLandUnit] = useState<'ACRE' | 'SOTANGSO'>('ACRE');
  const [shareMode, setShareMode] = useState<'DECIMAL' | 'TRADITIONAL'>('DECIMAL');

  const [copied, setCopied] = useState<boolean>(false);

  // Partners List
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

  // Convert total land to Sotangso
  const totalLandNum = parseFloat(totalLand) || 0;
  const totalSotangso = totalLandUnit === 'ACRE' ? totalLandNum * 100.0 : totalLandNum;

  // Compute each partner's share
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

    const partnerSotangso = totalSotangso * shareRatio;
    const partnerSqFt = partnerSotangso * SQ_FT_PER_SOTANGSO;
    const partnerKatha = partnerSotangso / sotangsoPerKatha;
    const partnerBigha = partnerSqFt / SQ_FT_PER_BIGHA;
    const partnerPrice = partnerSotangso * landPrice;

    return {
      ...p,
      shareRatio,
      sotangso: partnerSotangso,
      sqFeet: partnerSqFt,
      katha: partnerKatha,
      bigha: partnerBigha,
      price: partnerPrice,
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

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleCopySummary = () => {
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  const handleSaveToHistory = () => {
    sound.playBeep();
    onSaveHistory(
      totalLandNum,
      partners.length,
      `Khatian Distribution: ${partners.length} partners, Total ${totalLand} ${totalLandUnit}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Setup Card */}
      <SkeuoCard style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={20} />
              <span>{getTranslation('khatian_title', lang)}</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px', lineHeight: 1.6 }}>
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

        {/* Total Land Input */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-rim)' }}>
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
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-rim)' }}
            >
              {lang === 'BN' ? 'একর (Acre)' : 'Acre'}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playSwitch();
                setTotalLandUnit('SOTANGSO');
              }}
              className={`rocker-btn ${totalLandUnit === 'SOTANGSO' ? 'active-meters' : ''}`}
              style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-rim)' }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px', fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{getTranslation('khatian_share_sum', lang)}:</span>
            <span
              style={{
                color: Math.abs(totalShareAllocated - 1.0) < 0.0001 ? '#2E7D32' : totalShareAllocated > 1.0 ? '#D32F2F' : '#E65100',
                fontSize: '15px',
                fontFamily: 'Outfit, monospace',
              }}
            >
              {(totalShareAllocated * 100).toFixed(2)}% ({totalShareAllocated.toFixed(4)})
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)' }}>{getTranslation('khatian_remaining', lang)}:</span>{' '}
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
        <div style={{ width: '100%', height: '10px', background: 'var(--surface-plate)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-rim)' }}>
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
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#D32F2F', fontSize: '11px', fontWeight: 700 }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} color="#2E7D32" />
            <span>{getTranslation('khatian_result_title', lang)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({partners.length} Partners)</span>
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
              onClick={handleCopySummary}
              className="skeuo-btn skeuo-btn-brass"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? getTranslation('copied_success', lang) : getTranslation('copy_results', lang)}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
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
                  <label className="field-label">{getTranslation('khatian_share', lang)} (0.000 - 1.000)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={p.decimalShare}
                    onChange={(e) => handleUpdatePartner(p.id, { decimalShare: e.target.value })}
                    className="skeuo-input"
                    placeholder="e.g. 0.250"
                  />
                </div>
              ) : (
                /* Traditional 16 Ana Inputs */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(65px, 1fr))', gap: '8px' }}>
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
                    <label className="field-label">{getTranslation('gonda', lang)} (0-19)</label>
                    <input
                      type="number"
                      min="0"
                      max="19"
                      value={p.gonda}
                      onChange={(e) => handleUpdatePartner(p.id, { gonda: e.target.value })}
                      className="skeuo-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">{getTranslation('kara', lang)} (0-3)</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={p.kara}
                      onChange={(e) => handleUpdatePartner(p.id, { kara: e.target.value })}
                      className="skeuo-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">{getTranslation('kranti', lang)} (0-2)</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      value={p.kranti}
                      onChange={(e) => handleUpdatePartner(p.id, { kranti: e.target.value })}
                      className="skeuo-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">{getTranslation('til', lang)} (0-19)</label>
                    <input
                      type="number"
                      min="0"
                      max="19"
                      value={p.til}
                      onChange={(e) => handleUpdatePartner(p.id, { til: e.target.value })}
                      className="skeuo-input"
                    />
                  </div>
                </div>
              )}

              {/* Calculated Results Badge */}
              <div
                style={{
                  background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)',
                  border: '1px solid #A5D6A7',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: '8px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#2E7D32' }}>
                    {getTranslation('sotangso', lang)}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#1B5E20' }}>
                    {(p.sotangso || 0).toFixed(4)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#2E7D32' }}>
                    {getTranslation('katha', lang)}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#1B5E20' }}>
                    {(p.katha || 0).toFixed(3)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#2E7D32' }}>
                    {getTranslation('bigha', lang)}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#1B5E20' }}>
                    {(p.bigha || 0).toFixed(4)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#2E7D32' }}>
                    {getTranslation('sq_feet', lang)}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#1B5E20' }}>
                    {formatNumber(p.sqFeet || 0, 1)}
                  </div>
                </div>

                {landPrice > 0 && (
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#D32F2F' }}>
                      {getTranslation('total_price', lang)}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#B71C1C' }}>
                      {formatBDT(p.price || 0)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '20px' }}>
          <SkeuoButton
            label={getTranslation('khatian_calculate', lang)}
            colorScheme="green"
            onClick={handleSaveToHistory}
            className="w-full"
          />
        </div>
      </SkeuoCard>
    </div>
  );
};
