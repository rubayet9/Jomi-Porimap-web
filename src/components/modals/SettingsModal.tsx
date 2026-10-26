import React, { useState, useEffect } from 'react';
import {
  X,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Key,
  Check,
  Globe,
  Hourglass,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { AppLanguage, AppUnit, PriceUnit } from '../../types';
import { getTranslation } from '../../lib/translations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { sound } from '../../lib/sound';
import { DEFAULT_GEMINI_API_KEY } from '../../lib/gemini';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  unit: AppUnit;
  onUnitChange: (unit: AppUnit) => void;
  sotangsoPerKatha: number;
  onSotangsoPerKathaChange: (val: number) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  landPrice: number;
  onLandPriceChange: (price: number) => void;
  priceUnit: PriceUnit;
  onPriceUnitChange: (pUnit: PriceUnit) => void;
  onOpenDeveloper: () => void;
  currentUser?: { displayName: string | null; email: string | null } | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLangChange,
  isDark,
  onThemeToggle,
  unit,
  onUnitChange,
  sotangsoPerKatha,
  onSotangsoPerKathaChange,
  apiKey,
  onApiKeyChange,
  soundEnabled,
  onSoundToggle,
  landPrice,
  onLandPriceChange,
  priceUnit,
  onPriceUnitChange,
  onOpenDeveloper,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [tempApiKey, setTempApiKey] = useState(apiKey || DEFAULT_GEMINI_API_KEY);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempPrice, setTempPrice] = useState(landPrice > 0 ? String(landPrice) : '');
  const [customKatha, setCustomKatha] = useState(String(sotangsoPerKatha));
  const [saved, setSaved] = useState(false);

  // Accordion states - open by default to match guideline UI
  const [isManualExpanded, setIsManualExpanded] = useState(true);
  const [isFormulasExpanded, setIsFormulasExpanded] = useState(true);

  useEffect(() => {
    setTempApiKey(apiKey || DEFAULT_GEMINI_API_KEY);
    setTempPrice(landPrice > 0 ? String(landPrice) : '');
    setCustomKatha(String(sotangsoPerKatha));
  }, [apiKey, landPrice, sotangsoPerKatha, isOpen]);

  const isAdmin = currentUser?.email?.toLowerCase().trim() === 'rubayetfivermail@gmail.com';

  const handleKathaPreset = (val: number) => {
    sound.playClick();
    setCustomKatha(String(val));
    onSotangsoPerKathaChange(val);
  };

  const handleCustomKathaChange = (str: string) => {
    setCustomKatha(str);
    const num = parseFloat(str);
    if (!isNaN(num) && num > 0) {
      onSotangsoPerKathaChange(num);
    }
  };

  const handleSave = () => {
    sound.playClick();
    if (isAdmin) {
      onApiKeyChange(tempApiKey);
    }
    const parsedPrice = parseFloat(tempPrice) || 0;
    onLandPriceChange(parsedPrice);

    const parsedKatha = parseFloat(customKatha);
    if (!isNaN(parsedKatha) && parsedKatha > 0) {
      onSotangsoPerKathaChange(parsedKatha);
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  // Preset check helper
  const isPresetActive = (presetVal: number): boolean => {
    const current = parseFloat(customKatha) || sotangsoPerKatha;
    return Math.abs(current - presetVal) < 0.03;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          borderRadius: '24px',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <SkeuoCard showScrews style={{ padding: '24px' }}>
          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
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
              <span>⚙️</span>
              <span>{getTranslation('menu_settings', lang)}</span>
            </h3>

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
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Light Mode / Dark Mode Top Toggle */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: 'var(--surface-plate)',
                padding: '6px',
                borderRadius: '16px',
                border: '1px solid var(--border-rim)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playSwitch();
                  if (isDark) onThemeToggle();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: !isDark ? '1.5px solid #1B5E20' : '1px solid transparent',
                  background: !isDark
                    ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                    : 'transparent',
                  color: !isDark ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: !isDark ? '0 4px 10px rgba(27, 94, 32, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>☀️</span>
                <span>{lang === 'BN' ? 'লাইট মোড ☀️' : 'Light Mode ☀️'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSwitch();
                  if (!isDark) onThemeToggle();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: isDark ? '1.5px solid #1B5E20' : '1px solid transparent',
                  background: isDark
                    ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                    : 'transparent',
                  color: isDark ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: isDark ? '0 4px 10px rgba(27, 94, 32, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>🌙</span>
                <span>{lang === 'BN' ? 'ডার্ক মোড 🌙' : 'Dark Mode 🌙'}</span>
              </button>
            </div>

            {/* 2. Language: English / বাংলা */}
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#1B5E20',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Globe size={18} color="#2E7D32" />
                <span>{getTranslation('select_lang', lang)}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    onLangChange('EN');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: lang === 'EN' ? '1.5px solid #1B5E20' : '1px solid var(--border-rim)',
                    background: lang === 'EN'
                      ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                      : 'var(--surface-top)',
                    color: lang === 'EN' ? '#FFFFFF' : 'var(--text-main)',
                    boxShadow: lang === 'EN' ? '0 4px 10px rgba(27, 94, 32, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    onLangChange('BN');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: lang === 'BN' ? '1.5px solid #1B5E20' : '1px solid var(--border-rim)',
                    background: lang === 'BN'
                      ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                      : 'var(--surface-top)',
                    color: lang === 'BN' ? '#FFFFFF' : 'var(--text-main)',
                    boxShadow: lang === 'BN' ? '0 4px 10px rgba(27, 94, 32, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* 3. Unit: ফুট (ft) / মিটার (m) */}
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#1B5E20',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Hourglass size={18} color="#2E7D32" />
                <span>{getTranslation('select_unit', lang)}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    onUnitChange('FEET');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: unit === 'FEET' ? '1.5px solid #1B5E20' : '1px solid var(--border-rim)',
                    background: unit === 'FEET'
                      ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                      : 'var(--surface-top)',
                    color: unit === 'FEET' ? '#FFFFFF' : 'var(--text-main)',
                    boxShadow: unit === 'FEET' ? '0 4px 10px rgba(27, 94, 32, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lang === 'BN' ? 'ফুট (ft)' : 'Feet (ft)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    onUnitChange('METERS');
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: unit === 'METERS' ? '1.5px solid #1B5E20' : '1px solid var(--border-rim)',
                    background: unit === 'METERS'
                      ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                      : 'var(--surface-top)',
                    color: unit === 'METERS' ? '#FFFFFF' : 'var(--text-main)',
                    boxShadow: unit === 'METERS' ? '0 4px 10px rgba(27, 94, 32, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lang === 'BN' ? 'মিটার (m)' : 'Meters (m)'}
                </button>
              </div>
            </div>

            {/* 4. Katha Measurement (কাঠা পরিমাপ) */}
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#1B5E20',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Hourglass size={18} color="#2E7D32" />
                <span>{getTranslation('katha_measurement', lang)}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {getTranslation('katha_ratio_question', lang)}
              </div>

              {/* 4 Presets: 1.5, 1.65, 2.0, 2.7 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                {[1.5, 1.65, 2.0, 2.7].map((val) => {
                  const active = isPresetActive(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleKathaPreset(val)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: active ? '1.5px solid #1B5E20' : '1px solid var(--border-rim)',
                        background: active
                          ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                          : 'var(--surface-top)',
                        color: active ? '#FFFFFF' : 'var(--text-main)',
                        boxShadow: active ? '0 4px 8px rgba(27, 94, 32, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {val.toFixed(val === 1.65 ? 2 : 1)}
                    </button>
                  );
                })}
              </div>

              {/* Custom Katha Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {getTranslation('custom', lang)}
                </span>
                <div style={{ maxWidth: '160px', width: '100%' }}>
                  <input
                    type="number"
                    step="any"
                    value={customKatha}
                    onChange={(e) => handleCustomKathaChange(e.target.value)}
                    className="skeuo-input"
                    style={{ textAlign: 'center', fontWeight: 800 }}
                    placeholder="2.7"
                  />
                </div>
              </div>
            </div>

            {/* 5. Land Price (Unit) (জমির মূল্য (একক)) */}
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#1B5E20',
                  marginBottom: '8px',
                }}
              >
                {getTranslation('land_price_unit_title', lang)}
              </div>

              {/* 3 Buttons: শতাংশ, কাঠা, বিঘা */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                {(['SOTANGSO', 'KATHA', 'BIGHA'] as PriceUnit[]).map((pU) => {
                  const active = priceUnit === pU;
                  const label =
                    pU === 'SOTANGSO'
                      ? lang === 'BN' ? 'শতাংশ' : 'Sotangso'
                      : pU === 'KATHA'
                      ? lang === 'BN' ? 'কাঠা' : 'Katha'
                      : lang === 'BN' ? 'বিঘা' : 'Bigha';
                  return (
                    <button
                      key={pU}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onPriceUnitChange(pU);
                      }}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: active ? '1.5px solid #1B5E20' : '1px solid var(--border-rim)',
                        background: active
                          ? 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)'
                          : 'var(--surface-top)',
                        color: active ? '#FFFFFF' : 'var(--text-main)',
                        boxShadow: active ? '0 4px 8px rgba(27, 94, 32, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Price input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  className="skeuo-input"
                  placeholder={getTranslation('price_placeholder', lang)}
                  style={{ paddingRight: '45px' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 800,
                    color: '#2E7D32',
                    fontSize: '13px',
                  }}
                >
                  ৳
                </span>
              </div>
            </div>

            {/* 6. Expandable Accordion: ব্যবহার নির্দেশিকা */}
            <div
              style={{
                borderRadius: '14px',
                border: '1px solid var(--border-rim)',
                overflow: 'hidden',
                background: 'var(--surface-plate)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsManualExpanded(!isManualExpanded);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#2E7D32" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1B5E20' }}>
                    {getTranslation('user_manual_guide', lang)}
                  </span>
                </div>
                {isManualExpanded ? (
                  <ChevronUp size={18} color="#2E7D32" />
                ) : (
                  <ChevronDown size={18} color="#2E7D32" />
                )}
              </button>

              {isManualExpanded && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderTop: '1px solid var(--border-rim)',
                    fontSize: '13px',
                    lineHeight: 1.7,
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    background: 'var(--surface-top)',
                  }}
                >
                  <div>{getTranslation('manual_step_1', lang)}</div>
                  <div>{getTranslation('manual_step_2', lang)}</div>
                  <div>{getTranslation('manual_step_3', lang)}</div>
                  <div>{getTranslation('manual_step_4', lang)}</div>
                </div>
              )}
            </div>

            {/* 7. Expandable Accordion: ভূমি পরিমাপের সূত্রাবলি */}
            <div
              style={{
                borderRadius: '14px',
                border: '1px solid var(--border-rim)',
                overflow: 'hidden',
                background: 'var(--surface-plate)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsFormulasExpanded(!isFormulasExpanded);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="#2E7D32" />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1B5E20' }}>
                    {getTranslation('land_formulas', lang)}
                  </span>
                </div>
                {isFormulasExpanded ? (
                  <ChevronUp size={18} color="#2E7D32" />
                ) : (
                  <ChevronDown size={18} color="#2E7D32" />
                )}
              </button>

              {isFormulasExpanded && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderTop: '1px solid var(--border-rim)',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'var(--surface-top)',
                  }}
                >
                  <div>
                    <strong style={{ color: '#1B5E20', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
                      {lang === 'BN' ? 'আয়তক্ষেত্র' : 'Rectangle'}
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                      {lang === 'BN'
                        ? 'ক্ষেত্রফল = গড় দৈর্ঘ্য × গড় প্রস্থ = ((দৈর্ঘ্য ১ + দৈর্ঘ্য ২) / ২) × ((প্রস্থ ১ + প্রস্থ ২) / ২)'
                        : 'Area = Avg Length × Avg Width = ((Length 1 + Length 2) / 2) × ((Width 1 + Width 2) / 2)'}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: '#1B5E20', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
                      {lang === 'BN' ? 'ত্রিভুজ' : 'Triangle'}
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                      {lang === 'BN'
                        ? 'হেরন্সের সূত্র: s = (a+b+c)/২, ক্ষেত্রফল = √(s(s-a)(s-b)(s-c))'
                        : "Heron's formula: s = (a+b+c)/2, Area = √(s(s-a)(s-b)(s-c))"}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: '#1B5E20', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
                      {lang === 'BN' ? 'পঞ্চভুজ' : 'Pentagon'}
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                      {lang === 'BN'
                        ? 'ক্ষেত্রফল = ১.৭২০৪৮ × গড় বাহু² (পঞ্চভুজ আনুমানিক হিসাব)'
                        : 'Area = 1.72048 × Avg Side² (Approximate pentagon)'}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: '#1B5E20', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
                      {lang === 'BN' ? 'ষড়ভুজ' : 'Hexagon'}
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                      {lang === 'BN'
                        ? 'ক্ষেত্রফল = ২.৫৯৮০৮ × বাহু² (সুষম ষড়ভুজ)'
                        : 'Area = 2.59808 × Side² (Regular hexagon)'}
                    </div>
                  </div>

                  <div>
                    <strong style={{ color: '#1B5E20', display: 'block', marginBottom: '2px', fontSize: '13px' }}>
                      {lang === 'BN' ? 'কাস্টম ড্রয়িং' : 'Custom Drawing'}
                    </strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                      {lang === 'BN'
                        ? 'শু-লেস সূত্র: ক্ষেত্রফল = ০.৫ × |∑(x_i y_{i+1} - x_{i+1} y_i)|'
                        : 'Shoelace formula: Area = 0.5 × |∑(x_i y_{i+1} - x_{i+1} y_i)|'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 8. Button: আমাদের সম্পর্কে (About Us) */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenDeveloper();
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(46, 125, 50, 0.4)',
                background: 'rgba(46, 125, 50, 0.06)',
                color: '#1B5E20',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <Info size={18} color="#2E7D32" />
              <span>{getTranslation('about_us', lang)}</span>
            </button>

            {/* 9. Google Gemini API Key Input (Admin Only: rubayetfivermail@gmail.com) */}
            {isAdmin && (
              <div
                style={{
                  background: 'var(--surface-plate)',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ShieldCheck size={16} color="#10B981" />
                    <span>{getTranslation('gemini_key', lang)}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#059669',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      Admin Only
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowApiKey(!showApiKey);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#059669',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showApiKey ? (lang === 'BN' ? 'লুকান' : 'Hide') : (lang === 'BN' ? 'দেখুন' : 'Show')}</span>
                  </button>
                </div>

                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {getTranslation('gemini_key_hint', lang)}
                </p>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="skeuo-input"
                    placeholder="••••••••••••••••••••••••"
                    style={{
                      fontSize: '12px',
                      fontFamily: showApiKey ? 'monospace' : 'inherit',
                      letterSpacing: showApiKey ? 'normal' : '2px',
                      paddingRight: '38px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowApiKey(!showApiKey);
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* 10. Sound Toggle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                background: 'var(--surface-plate)',
                borderRadius: '14px',
                border: '1px solid var(--border-rim)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🔊</span>
                <span>{getTranslation('sound_fx', lang)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSoundToggle();
                }}
                className={`rocker-btn ${soundEnabled ? 'active-feet' : ''}`}
                style={{
                  borderRadius: '11px',
                  padding: '7px 16px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: '85px',
                  justifyContent: 'center',
                }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{soundEnabled ? (lang === 'BN' ? 'চালু' : 'ON') : (lang === 'BN' ? 'বন্ধ' : 'OFF')}</span>
              </button>
            </div>

            {/* Save Button */}
            <div style={{ marginTop: '6px' }}>
              <SkeuoButton
                label={
                  saved
                    ? lang === 'BN'
                      ? 'সংরক্ষিত হয়েছে!'
                      : 'Saved!'
                    : getTranslation('save_settings', lang)
                }
                icon={saved ? <Check size={18} /> : undefined}
                colorScheme="green"
                onClick={handleSave}
                className="w-full"
              />
            </div>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
