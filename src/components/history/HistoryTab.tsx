import React, { useState } from 'react';
import {
  Trash2,
  Copy,
  Check,
  Coins,
  History,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Printer,
  FileDown,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { AppLanguage, CalculationHistoryItem, PriceUnit } from '../../types';
import { getTranslation } from '../../lib/translations';
import { formatBDT, formatNumber } from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { sound } from '../../lib/sound';

interface HistoryTabProps {
  historyList: CalculationHistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onViewReceipt: (item: CalculationHistoryItem, autoAction?: 'PRINT' | 'PDF' | 'JPG') => void;
  landPrice: number;
  onLandPriceChange: (price: number) => void;
  priceUnit: PriceUnit;
  onPriceUnitChange: (unit: PriceUnit) => void;
  sotangsoPerKatha: number;
  lang: AppLanguage;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  historyList,
  onClearHistory,
  onDeleteHistoryItem,
  onViewReceipt,
  lang,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyItem = (item: CalculationHistoryItem) => {
    sound.playClick();
    const txt = `[জমি পরিমাপ হিস্ট্রি / Survey Record]
• আকার/মডিউল: ${item.shapeType} (${item.dateStr})
• পরিমাপ: ${item.inputsDesc}
• ক্ষেত্রফল: ${formatNumber(item.sqFeet, 2)} Sq.Ft (${formatNumber(item.sqMeters, 2)} Sq.M)
• শতাংশ: ${item.sotangso.toFixed(4)}
• কাঠা: ${item.katha.toFixed(3)}
• বিঘা: ${item.bigha.toFixed(4)}
${item.totalPrice ? `• মূল্য: ${formatBDT(item.totalPrice)}` : ''}`;

    navigator.clipboard.writeText(txt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    sound.playReset();
    if (window.confirm(getTranslation('history_clear_confirm', lang))) {
      onClearHistory();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* SAVED CALCULATION HISTORY */}
      <SkeuoCard showScrews style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#2E7D32" />
            <span>{getTranslation('history_title', lang)}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({historyList.length})</span>
          </h2>

          {historyList.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="skeuo-btn skeuo-btn-danger"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <RotateCcw size={14} />
              <span>{getTranslation('history_clear', lang)}</span>
            </button>
          )}
        </div>

        {historyList.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <History size={36} color="var(--border-rim)" />
            <p>{getTranslation('history_empty', lang)}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {historyList.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--surface-plate)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  border: '1px solid var(--border-rim)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#2E7D32',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 900,
                      }}
                    >
                      {item.shapeType}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{item.dateStr}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyItem(item)}
                      title="Copy item"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedId === item.id ? '#2E7D32' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {copiedId === item.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      title="Delete item"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#D32F2F',
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                  {item.inputsDesc}
                </div>

                {/* Land metrics row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '6px',
                    background: 'var(--surface-top)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-rim)',
                    textAlign: 'center',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Sq.Feet</span>
                    <span style={{ fontWeight: 800, color: '#1B5E20' }}>{formatNumber(item.sqFeet, 1)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>শতাংশ</span>
                    <span style={{ fontWeight: 800, color: '#D32F2F' }}>{item.sotangso.toFixed(4)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>কাঠা</span>
                    <span style={{ fontWeight: 800, color: '#E65100' }}>{item.katha.toFixed(3)}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>বিঘা</span>
                    <span style={{ fontWeight: 800, color: '#1976D2' }}>{item.bigha.toFixed(4)}</span>
                  </div>
                  {item.totalPrice ? (
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>মূল্য</span>
                      <span style={{ fontWeight: 800, color: '#2E7D32' }}>{formatBDT(item.totalPrice)}</span>
                    </div>
                  ) : null}
                </div>

                {/* Print, PDF, JPG, View Receipt Actions Bar */}
                <div
                  className="history-item-actions"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                    paddingTop: '6px',
                    borderTop: '1px dashed var(--border-rim)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onViewReceipt(item)}
                    className="history-action-btn view-btn"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.22) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#047857',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}
                    title={lang === 'BN' ? 'পূর্ণাঙ্গ রসিদ ও প্রত্যয়নপত্র দেখুন' : 'View Full Certificate'}
                  >
                    <FileText size={13} />
                    <span>{lang === 'BN' ? 'রসিদ দেখুন' : 'View Receipt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewReceipt(item, 'PRINT')}
                    className="history-action-btn"
                    style={{
                      background: 'var(--surface-top)',
                      border: '1px solid var(--border-rim)',
                      color: 'var(--text-main)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                    }}
                    title={lang === 'BN' ? 'প্রিন্ট করুন' : 'Print Receipt'}
                  >
                    <Printer size={13} />
                    <span>{lang === 'BN' ? 'প্রিন্ট' : 'Print'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewReceipt(item, 'PDF')}
                    className="history-action-btn pdf-btn"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                      whiteSpace: 'nowrap',
                    }}
                    title={lang === 'BN' ? 'পিডিএফ ফাইল ডাউনলোড' : 'Download PDF'}
                  >
                    <FileDown size={13} />
                    <span>PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewReceipt(item, 'JPG')}
                    className="history-action-btn jpg-btn"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                      whiteSpace: 'nowrap',
                    }}
                    title={lang === 'BN' ? 'জেপিজি ছবি ডাউনলোড' : 'Download JPG'}
                  >
                    <ImageIcon size={13} />
                    <span>JPG</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SkeuoCard>
    </div>
  );
};
