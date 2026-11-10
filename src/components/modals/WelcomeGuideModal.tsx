import React, { useState } from 'react';
import {
  X,
  Settings,
  Sparkles,
  MapPin,
  Coins,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { AppLanguage, PriceUnit } from '../../types';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';
import { toBengaliNumerals } from '../../lib/calculations';

interface WelcomeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  lang: AppLanguage;
  sotangsoPerKatha: number;
  landPrice: number;
  priceUnit: PriceUnit;
}

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  lang,
  sotangsoPerKatha,
  landPrice,
  priceUnit,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    sound.playClick();
    if (dontShowAgain) {
      localStorage.setItem('jomi_welcome_guide_disabled', 'true');
    }
    onClose();
  };

  const handleGoToSettings = () => {
    sound.playClick();
    if (dontShowAgain) {
      localStorage.setItem('jomi_welcome_guide_disabled', 'true');
    }
    onClose();
    onOpenSettings();
  };

  const fmtNum = (n: number) => {
    const s = n.toLocaleString('en-US');
    return lang === 'BN' ? toBengaliNumerals(s) : s;
  };

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
      ? 'শতাংশ'
      : 'Sotangso';

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(78, 250, 138, 0.25)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <SkeuoCard
          showScrews
          style={{
            padding: '24px 22px',
            position: 'relative',
          }}
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--surface-plate)',
              border: '1px solid var(--border-rim)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={lang === 'BN' ? 'বন্ধ করুন' : 'Close'}
          >
            <X size={18} />
          </button>

          {/* Header Brand & Title */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                boxShadow: '0 8px 24px rgba(46, 125, 50, 0.45)',
                border: '2px solid rgba(78, 250, 138, 0.5)',
                marginBottom: '12px',
                overflow: 'hidden',
              }}
            >
              <img
                src="/app-icon.png"
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#10B981',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.4px',
                marginBottom: '6px',
              }}
            >
              <Sparkles size={13} />
              <span>{lang === 'BN' ? 'ব্যবহার নির্দেশিকা ও সেটআপ' : 'Quick Setup & Usage Guide'}</span>
            </div>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: '4px 0 6px 0',
                letterSpacing: '-0.3px',
              }}
            >
              {lang === 'BN' ? 'স্বাগতম! সঠিক পরিমাপে জমি হিসাব করুন' : 'Welcome to Land Measurement'}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                margin: 0,
                padding: '0 8px',
              }}
            >
              {lang === 'BN'
                ? 'নির্ভুল ফলাফল ও সঠিক মোট বাজার মূল্য পেতে পরিমাপ শুরুর পূর্বে নিচের বিষয়গুলো নিশ্চিত করে নিন:'
                : 'To ensure 100% accurate calculations and proper valuation, please review these key setups:'}
            </p>
          </div>

          {/* Guide Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {/* Guide Card 1: Katha Ratio */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px',
                borderRadius: '14px',
                background: 'var(--surface-plate)',
                border: '1.5px solid var(--border-rim)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                }}
              >
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginBottom: '4px',
                  }}
                >
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {lang === 'BN' ? '১. আপনার এলাকার কাঠা পরিমাপ' : '1. Regional Katha Ratio'}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#059669',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {lang === 'BN' ? `বর্তমান: ${fmtNum(sotangsoPerKatha)} শতক` : `Current: ${sotangsoPerKatha} Dec`}
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'BN'
                    ? 'বাংলাদেশে অঞ্চলভেদে ১ কাঠার মান ভিন্ন হয় (যেমন: ১.৫, ১.৬৫, ২.০ বা ২.৭ শতাংশ)। সেটিংস থেকে আপনার এলাকার কাঠার মান সেট করুন।'
                    : 'Katha sizes vary by region in Bangladesh (e.g., 1.5, 1.65, 2.0, or 2.7 Decimals). Configure this from Settings.'}
                </p>
              </div>
            </div>

            {/* Guide Card 2: Land Price */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px',
                borderRadius: '14px',
                background: 'var(--surface-plate)',
                border: '1.5px solid var(--border-rim)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Coins size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginBottom: '4px',
                  }}
                >
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {lang === 'BN' ? '২. জমির দর ও বাজার মূল্য নির্ধারণ' : '2. Land Valuation & Rate'}
                  </h4>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#D97706',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    ৳ {fmtNum(landPrice)} / {priceUnitLabel}
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'BN'
                    ? 'সেটিংস থেকে আপনার জমির শতক, কাঠা বা বিঘা প্রতি বিক্রয়/ক্রয় মূল্য নির্ধারণ করে রাখলে পরিমাপের সাথে সাথেই মোট টাকার পরিমাণ স্বয়ংক্রিয়ভাবে হিসাব হবে।'
                    : 'Set your land purchase/sale rate per Sotangso, Katha, or Bigha to automatically see total valuation with every calculation.'}
                </p>
              </div>
            </div>

            {/* Guide Card 3: Key Features Tips */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '14px',
                borderRadius: '14px',
                background: 'var(--surface-plate)',
                border: '1.5px solid var(--border-rim)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
                }}
              >
                <Compass size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  {lang === 'BN' ? '৩. ত্রিভুজায়ন ও খতিয়ান ক্যালকুলেটর' : '3. Triangulation & Khatian OCR'}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'BN'
                    ? 'আঁকাবাঁকা ৪ বাহুর জমির জন্য "ত্রিভুজায়ন" ট্যাব এবং খতিয়ান বণ্টন ও ছবি থেকে বাংলা OCR পাঠের জন্য "খতিয়ান" ও "এআই সহকারী" ব্যবহার করুন।'
                    : 'Use the "Triangulation" tab for irregular 4-sided plots and "Khatian" / "AI Assistant" for Bangla OCR document analysis.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleGoToSettings}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <Settings size={17} />
                <span>{lang === 'BN' ? '⚙️ সেটিংস ওপেন ও কনফিগার করুন' : 'Open Settings Now'}</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="welcome-guide-start-btn"
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  border: '2px solid #10B981',
                  background: 'var(--surface-plate, #FFFFFF)',
                  color: 'var(--text-main, #0E2417)',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 10px rgba(16, 185, 129, 0.18)',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={18} color="#10B981" />
                <span style={{ color: 'var(--text-main, #0E2417)', fontWeight: 800 }}>
                  {lang === 'BN' ? 'ঠিক আছে, বুঝেছি' : 'Got it, Start'}
                </span>
              </button>
            </div>

            {/* Direct Android APK Download Banner */}
            <a
              href="/Jomi-Porimap-v1.0.apk"
              download="Jomi Porimap-v1.0.apk"
              onClick={() => sound.playClick()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid #10B981',
                color: 'var(--text-main, #0E2417)',
                fontSize: '12.5px',
                fontWeight: 800,
                textDecoration: 'none',
                marginTop: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>📱 {lang === 'BN' ? 'ফোনে অ্যান্ড্রয়েড অ্যাপ (APK) ইনস্টল করতে ক্লিক করুন' : 'Click here to download Android App (APK)'}</span>
            </a>

            {/* Do not show again checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginTop: '6px',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{
                  accentColor: '#10B981',
                  cursor: 'pointer',
                  width: '14px',
                  height: '14px',
                }}
              />
              <span>
                {lang === 'BN' ? 'ভবিষ্যতে এই নির্দেশিকাটি আর দেখাবেন না' : 'Do not show this guide automatically again'}
              </span>
            </label>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};

