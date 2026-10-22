import React from 'react';
import { X, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';
import { AppLanguage } from '../../types';
import { getTranslation } from '../../lib/translations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <SkeuoCard showScrews style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} />
              <span>{getTranslation('user_manual', lang)}</span>
            </h3>

            <button
              type="button"
              onClick={handleClose}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
            {/* Step-by-Step Guide */}
            <div style={{ background: 'var(--surface-plate)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-rim)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E20', marginBottom: '10px' }}>
                {lang === 'BN' ? '📌 ব্যবহারের প্রাথমিক ধাপসমূহ:' : '📌 Step-by-Step Usage Guide:'}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', lineHeight: 1.6 }}>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={16} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{getTranslation('manual_step_1', lang)}</span>
                </li>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={16} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{getTranslation('manual_step_2', lang)}</span>
                </li>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={16} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{getTranslation('manual_step_3', lang)}</span>
                </li>
                <li style={{ display: 'flex', gap: '8px' }}>
                  <CheckCircle size={16} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{getTranslation('manual_step_4', lang)}</span>
                </li>
              </ul>
            </div>

            {/* Standard Land Units Table */}
            <div style={{ background: 'var(--surface-plate)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-rim)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E20', marginBottom: '8px' }}>
                {lang === 'BN' ? '📐 বাংলাদেশি ভূমি পরিমাপের স্ট্যান্ডার্ড একক:' : '📐 Standard Bangladesh Land Conversions:'}
              </h4>
              <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text-main)' }}>
                <div>• <strong>১ শতাংশ / শতক (Sotangso)</strong> = ৪৩৫.৬০ বর্গফুট = ৪০.৪৬৭ বর্গমিটার</div>
                <div>• <strong>১ কাঠা (Katha)</strong> = ৭২০.০০ বর্গফুট ≈ ১.৬৫২৮৯ শতাংশ</div>
                <div>• <strong>১ বিঘা (Bigha)</strong> = ২০ কাঠা = ১৪,৪০০ বর্গফুট ≈ ৩৩.০৫৮ শতাংশ</div>
                <div>• <strong>১ একর (Acre)</strong> = ১০০ শতাংশ = ৪৩,৫৬০ বর্গফুট ≈ ৩.০২৫ বিঘা</div>
                <div>• <strong>১ ছটাক (Chhatak)</strong> = ৪৫ বর্গফুট (১৬ ছটাক = ১ কাঠা)</div>
                <div>• <strong>১ হেক্টর (Hectare)</strong> = ২.৪৭ একর = ১,০৭,৬৩৯.১ বর্গফুট</div>
              </div>
            </div>

            {/* Traditional Khatian Math */}
            <div style={{ background: 'var(--surface-plate)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-rim)' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E20', marginBottom: '8px' }}>
                {lang === 'BN' ? '📜 খতিয়ানের আনা-গণ্ডা-কড়া হিসাব:' : '📜 Traditional 16-Ana Khatian Math:'}
              </h4>
              <div style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-main)' }}>
                <div>• <strong>১৬ আনা</strong> = ১.০০০ (সম্পূর্ণ হিস্যা)</div>
                <div>• <strong>১ আনা</strong> = ২০ গণ্ডা = ৯,৬০০ তিল</div>
                <div>• <strong>১ গণ্ডা</strong> = ৪ কড়া = ৪৮০ তিল</div>
                <div>• <strong>১ কড়া</strong> = ৩ ক্রান্তি = ১২০ তিল</div>
                <div>• <strong>১ ক্রান্তি</strong> = ২০ তিল</div>
                <div>• মোট তিল = ১৬ × ২০ × ৪ × ৩ × ২০ = <strong>১,৫৩,৬০০ তিল</strong>।</div>
              </div>
            </div>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
