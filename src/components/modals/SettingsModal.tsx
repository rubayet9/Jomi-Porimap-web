import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, VolumeX, Key, Check, Sliders, DollarSign } from 'lucide-react';
import { AppLanguage } from '../../types';
import { getTranslation } from '../../lib/translations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { sound } from '../../lib/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  sotangsoPerKatha: number;
  onSotangsoPerKathaChange: (val: number) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  landPrice: number;
  onLandPriceChange: (price: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLangChange,
  isDark,
  onThemeToggle,
  sotangsoPerKatha,
  onSotangsoPerKathaChange,
  apiKey,
  onApiKeyChange,
  soundEnabled,
  onSoundToggle,
  landPrice,
  onLandPriceChange,
}) => {
  if (!isOpen) return null;

  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempPrice, setTempPrice] = useState(String(landPrice));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    sound.playClick();
    onApiKeyChange(tempApiKey);
    const parsedPrice = parseFloat(tempPrice) || 0;
    onLandPriceChange(parsedPrice);

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <SkeuoCard showScrews style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} />
              <span>{getTranslation('settings_title', lang)}</span>
            </h3>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {getTranslation('theme_mode', lang)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isDark ? getTranslation('dark_mode', lang) : getTranslation('light_mode', lang)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playSwitch();
                  onThemeToggle();
                }}
                className={`rocker-btn ${isDark ? 'active-meters' : 'active-feet'}`}
                style={{ borderRadius: '12px', padding: '8px 14px', border: '1px solid var(--border-rim)' }}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>

            {/* 2. Language Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {getTranslation('select_lang', lang)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  বাংলা (Bengali) / English
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    onLangChange('BN');
                  }}
                  className={`rocker-btn ${lang === 'BN' ? 'active-feet' : ''}`}
                  style={{ borderRadius: '10px', padding: '6px 12px', border: '1px solid var(--border-rim)' }}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSwitch();
                    onLangChange('EN');
                  }}
                  className={`rocker-btn ${lang === 'EN' ? 'active-meters' : ''}`}
                  style={{ borderRadius: '10px', padding: '6px 12px', border: '1px solid var(--border-rim)' }}
                >
                  EN
                </button>
              </div>
            </div>

            {/* 3. Audio Click Feedback */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {getTranslation('sound_fx', lang)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tactile synthesized mechanical sound
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSoundToggle();
                }}
                className={`rocker-btn ${soundEnabled ? 'active-feet' : ''}`}
                style={{ borderRadius: '10px', padding: '8px 12px', border: '1px solid var(--border-rim)' }}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* 4. Katha Standard Definition */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {getTranslation('katha_definition', lang)}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSotangsoPerKathaChange(1.65289);
                  }}
                  className={`rocker-btn ${Math.abs(sotangsoPerKatha - 1.65289) < 0.05 ? 'active-feet' : ''}`}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', fontSize: '11px', border: '1px solid var(--border-rim)' }}
                >
                  {getTranslation('katha_standard', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSotangsoPerKathaChange(2.70);
                  }}
                  className={`rocker-btn ${Math.abs(sotangsoPerKatha - 2.70) < 0.05 ? 'active-meters' : ''}`}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', fontSize: '11px', border: '1px solid var(--border-rim)' }}
                >
                  {getTranslation('katha_custom', lang)}
                </button>
              </div>
            </div>

            {/* 5. Default Land Price */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {lang === 'BN' ? 'জমির ডিফল্ট রেট (প্রতি শতাংশ টাকা)' : 'Default Land Rate (BDT per Sotangso)'}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  className="skeuo-input"
                  placeholder="e.g. 50000"
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-muted)' }}>
                  BDT ৳
                </span>
              </div>
            </div>

            {/* 6. Google Gemini API Key */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} color="#2E7D32" />
                <span>{getTranslation('gemini_key', lang)}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {getTranslation('gemini_key_hint', lang)}
              </p>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="skeuo-input"
                placeholder="AIzaSy..."
              />
            </div>

            {/* Save Button */}
            <div style={{ marginTop: '10px' }}>
              <SkeuoButton
                label={saved ? (lang === 'BN' ? 'সংরক্ষিত হয়েছে!' : 'Saved!') : getTranslation('save_settings', lang)}
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
