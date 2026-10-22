import React from 'react';
import { X, User, Calendar, Flag, Globe, Mail, Heart } from 'lucide-react';
import { AppLanguage } from '../../types';
import { getTranslation } from '../../lib/translations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const AboutDeveloperModal: React.FC<AboutDeveloperModalProps> = ({
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
          {/* Top Bar with Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👨‍💻</span>
              <span>{getTranslation('developer_info', lang)}</span>
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

          {/* Profile Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 0',
              textAlign: 'center',
            }}
          >
            {/* Avatar Frame with green border */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #2E7D32',
                padding: '4px',
                background: 'var(--surface-plate)',
                boxShadow: '0 8px 20px rgba(46, 125, 50, 0.3)',
                marginBottom: '16px',
                overflow: 'hidden',
              }}
            >
              <img
                src="/profile_pic.png"
                alt="Rubayet Khan"
                onError={(e) => {
                  // Fallback if image path differs
                  (e.target as HTMLElement).style.display = 'none';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
              />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)' }}>
              {getTranslation('dev_name', lang)}
            </h2>
            <p style={{ fontSize: '13px', color: '#2E7D32', fontWeight: 700, marginTop: '2px' }}>
              Full-Stack & Mobile App Developer
            </p>
          </div>

          {/* Personal Info Grid */}
          <div
            style={{
              background: 'var(--surface-plate)',
              borderRadius: '14px',
              padding: '14px 18px',
              border: '1px solid var(--border-rim)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <User size={18} color="#2E7D32" />
              <span style={{ color: 'var(--text-muted)' }}>Name:</span>
              <strong style={{ color: 'var(--text-main)' }}>Rubayet Khan</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Calendar size={18} color="#2E7D32" />
              <span style={{ color: 'var(--text-muted)' }}>Age:</span>
              <strong style={{ color: 'var(--text-main)' }}>{getTranslation('dev_age', lang)}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <Flag size={18} color="#2E7D32" />
              <span style={{ color: 'var(--text-muted)' }}>Country:</span>
              <strong style={{ color: 'var(--text-main)' }}>{getTranslation('dev_country', lang)}</strong>
            </div>
          </div>

          {/* About App / Mission */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
              {lang === 'BN' ? 'আমাদের লক্ষ্য ও পরিচিতি' : 'About Our Mission'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {getTranslation('dev_statement', lang)}
            </p>
          </div>

          {/* Contact Details */}
          <div
            style={{
              background: 'var(--surface-plate)',
              borderRadius: '14px',
              padding: '14px 18px',
              border: '1px solid var(--border-rim)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B5E20' }}>
              Contact Details:
            </div>

            <a
              href="https://rubayetkhan.is-best.net"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#2E7D32',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <Globe size={16} />
              <span>rubayetkhan.is-best.net</span>
            </a>

            <a
              href="mailto:rubayetfivermail@gmail.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#2E7D32',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              <Mail size={16} />
              <span>rubayetfivermail@gmail.com</span>
            </a>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span>Crafted with</span>
            <Heart size={14} color="#D32F2F" fill="#D32F2F" />
            <span>by Rubayet Khan © 2024-2026</span>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
