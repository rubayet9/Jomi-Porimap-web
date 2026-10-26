import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { useErrorHandler, AppErrorItem } from '../../context/ErrorContext';
import { sound } from '../../lib/sound';

interface GlobalErrorPopupProps {
  lang?: 'BN' | 'EN';
}

export const GlobalErrorPopup: React.FC<GlobalErrorPopupProps> = ({ lang = 'BN' }) => {
  const { errors, dismissError, clearAllErrors } = useErrorHandler();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (errors.length === 0) return null;

  const handleCopy = (item: AppErrorItem) => {
    sound.playClick();
    const copyText = `[${item.title}]\n${item.message}\n${item.details ? `Details:\n${item.details}` : ''}`;
    navigator.clipboard.writeText(copyText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const toggleExpand = (id: string) => {
    sound.playClick();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '460px',
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}
    >
      {errors.map((item, index) => {
        const isError = item.severity === 'error';
        const isWarning = item.severity === 'warning';
        const isInfo = item.severity === 'info';
        const isExpanded = expandedId === item.id;
        const isCopied = copiedId === item.id;

        // Accent colors based on severity
        const glowColor = isError
          ? 'rgba(239, 68, 68, 0.45)'
          : isWarning
          ? 'rgba(245, 158, 11, 0.45)'
          : 'rgba(52, 211, 153, 0.45)';

        const borderColor = isError
          ? 'rgba(239, 68, 68, 0.4)'
          : isWarning
          ? 'rgba(245, 158, 11, 0.4)'
          : 'rgba(52, 211, 153, 0.4)';

        const iconBg = isError
          ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
          : isWarning
          ? 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
          : 'linear-gradient(135deg, #10B981 0%, #047857 100%)';

        return (
          <div
            key={item.id}
            role="alert"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: `1.5px solid ${borderColor}`,
              borderTop: '1.5px solid rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '16px 18px',
              boxShadow: `0 16px 36px rgba(0, 0, 0, 0.16), 0 4px 12px ${glowColor}, inset 0 1px 2px rgba(255, 255, 255, 0.8)`,
              color: '#1D2920',
              animation: 'slideUpGlass 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="dark:bg-slate-900/90 dark:text-emerald-50 dark:border-red-500/30"
          >
            {/* Top subtle highlight shimmer */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: isError
                  ? 'linear-gradient(90deg, #EF4444, #F87171, #EF4444)'
                  : isWarning
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)'
                  : 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Icon Container with glowing ring */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${glowColor}`,
                  border: '1.5px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                {isError && <ShieldAlert size={20} />}
                {isWarning && <AlertTriangle size={20} />}
                {isInfo && <Info size={20} />}
              </div>

              {/* Title & Message */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 800,
                      margin: 0,
                      color: isError ? '#B91C1C' : isWarning ? '#B45309' : '#047857',
                      letterSpacing: '-0.2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{item.title}</span>
                  </h4>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      dismissError(item.id);
                    }}
                    title={lang === 'BN' ? 'বন্ধ করুন' : 'Dismiss'}
                    style={{
                      background: 'rgba(0, 0, 0, 0.05)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    marginTop: '4px',
                    marginBottom: '8px',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    wordBreak: 'break-word',
                  }}
                >
                  {item.message}
                </p>

                {/* Optional expandable technical details */}
                {item.details && (
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isError ? '#DC2626' : '#2563EB',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>
                        {isExpanded
                          ? lang === 'BN'
                            ? 'কারিগরি তথ্য লুকান'
                            : 'Hide Technical Details'
                          : lang === 'BN'
                          ? 'কারিগরি তথ্য দেখুন'
                          : 'View Technical Details'}
                      </span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '10px 12px',
                          background: 'rgba(15, 23, 42, 0.07)',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          maxHeight: '140px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          color: '#334155',
                          lineHeight: '1.4',
                        }}
                      >
                        {item.details}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '10px',
                  }}
                >
                  {/* Copy Error Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCopied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>
                      {isCopied
                        ? lang === 'BN'
                          ? 'কপি করা হয়েছে'
                          : 'Copied!'
                        : lang === 'BN'
                        ? 'ত্রুটি কপি করুন'
                        : 'Copy Error'}
                    </span>
                  </button>

                  {/* Retry button if provided */}
                  {item.onRetry && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        item.onRetry?.();
                        dismissError(item.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                        color: '#FFFFFF',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <RefreshCw size={13} />
                      <span>{lang === 'BN' ? 'পুনরায় চেষ্টা' : 'Retry'}</span>
                    </button>
                  )}

                  {/* Dismiss */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      dismissError(item.id);
                    }}
                    style={{
                      marginLeft: 'auto',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'BN' ? 'ঠিক আছে' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {errors.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              sound.playReset();
              clearAllErrors();
            }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {lang === 'BN' ? 'সব নোটিফিকেশন মুছুন' : 'Clear All'}
          </button>
        </div>
      )}
    </div>
  );
};
