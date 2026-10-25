import React from 'react';
import {
  Compass,
  Settings,
  HelpCircle,
  User,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Languages,
} from 'lucide-react';
import { AppLanguage } from '../../types';
import { getTranslation } from '../../lib/translations';
import { sound } from '../../lib/sound';

interface HeaderProps {
  lang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onOpenSettings: () => void;
  onOpenDeveloper: () => void;
  onOpenManual: () => void;
  currentUser?: { displayName: string | null; email: string | null } | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLangChange,
  isDark,
  onThemeToggle,
  soundEnabled,
  onSoundToggle,
  onOpenSettings,
  onOpenDeveloper,
  onOpenManual,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0 16px 0',
        borderBottom: '1px solid var(--border-rim)',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Brand & Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 6px 14px rgba(46, 125, 50, 0.35)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <Compass size={26} />
        </div>

        <div>
          <h1
            style={{
              fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{getTranslation('app_title', lang)}</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {getTranslation('subtitle', lang)}
          </p>
        </div>
      </div>

      {/* Header Controls */}
      <div
        className="header-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--surface-plate)',
          padding: '6px 10px',
          borderRadius: '16px',
          border: '1px solid var(--border-rim)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Language switch */}
        <button
          type="button"
          onClick={() => {
            sound.playSwitch();
            onLangChange(lang === 'BN' ? 'EN' : 'BN');
          }}
          title={lang === 'BN' ? 'ইংরেজি ভাষায় পরিবর্তন' : 'Switch to Bangla'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#2E7D32',
            fontWeight: 800,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '8px',
          }}
        >
          <Languages size={15} />
          <span>{lang === 'BN' ? 'EN' : 'বাং'}</span>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-rim)' }} />

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onSoundToggle();
          }}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => {
            sound.playSwitch();
            onThemeToggle();
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-rim)' }} />

        {/* User Manual */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenManual();
          }}
          title={getTranslation('user_manual', lang)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <HelpCircle size={16} />
        </button>

        {/* Settings */}
        <button
          type="button"
          id="settings-btn"
          aria-label={getTranslation('menu_settings', lang)}
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          title={getTranslation('menu_settings', lang)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Settings size={18} />
        </button>

        {/* User Profile / Auth Button Beside Settings */}
        {currentUser ? (
          <button
            type="button"
            id="user-profile-btn"
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            title={currentUser.displayName || currentUser.email || 'Profile'}
            style={{
              background: 'rgba(46, 125, 50, 0.12)',
              border: '1px solid rgba(46, 125, 50, 0.35)',
              borderRadius: '999px',
              padding: '3px 8px 3px 4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 900,
                position: 'relative',
              }}
            >
              {((currentUser.displayName || currentUser.email || 'U')[0]).toUpperCase()}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#4EFA8A',
                  border: '1px solid #FFFFFF',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#1B5E20',
                maxWidth: '90px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {(currentUser.displayName || currentUser.email || 'আমিন').split(' ')[0]}
            </span>
          </button>
        ) : (
          <button
            type="button"
            id="user-login-btn"
            onClick={() => {
              sound.playClick();
              onOpenAuth();
            }}
            title={lang === 'BN' ? 'লগইন বা সাইন আপ' : 'Login or Sign Up'}
            style={{
              background: 'linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)',
              color: '#FFFFFF',
              border: '1px solid #144417',
              borderRadius: '10px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(27, 94, 32, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={14} />
            <span>{lang === 'BN' ? 'লগইন' : 'Login'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
