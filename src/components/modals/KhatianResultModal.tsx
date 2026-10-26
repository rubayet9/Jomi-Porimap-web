import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  FileDown,
  Image as ImageIcon,
  Scale,
  FileText,
  Loader2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AppLanguage, PriceUnit, KhatianPartner } from '../../types';
import { formatBDT, formatNumber, toBengaliNumerals } from '../../lib/calculations';
import { sound } from '../../lib/sound';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';

export interface KhatianResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  mode: 'SINGLE' | 'MULTI';
  khatianNo?: string;
  daagNo?: string;
  mouza?: string;
  landPrice: number;
  priceUnit?: PriceUnit;
  sotangsoPerKatha: number;
  singleData?: {
    totalAcre: string;
    personShare: string;
    sotangso: number;
    katha: number;
    bigha: number;
    acre: number;
    sqFt: number;
    sqM: number;
    price: number;
  };
  multiData?: {
    totalLand: string;
    totalLandUnit: 'ACRE' | 'SOTANGSO';
    totalSotangso: number;
    totalSqFt: number;
    totalKatha: number;
    totalBigha: number;
    totalPrice: number;
    partners: Array<
      KhatianPartner & {
        shareRatio: number;
        sotangso: number;
        sqFeet: number;
        katha: number;
        bigha: number;
        price: number;
      }
    >;
  };
}

export const KhatianResultModal: React.FC<KhatianResultModalProps> = ({
  isOpen,
  onClose,
  lang,
  mode,
  khatianNo = '',
  daagNo = '',
  mouza = '',
  landPrice,
  sotangsoPerKatha,
  singleData,
  multiData,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const receiptId = `KHT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDateStr = new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fmt = (val?: number, decimals: number = 3): string => {
    if (val === undefined || isNaN(val)) return '0.00';
    const s = val.toFixed(decimals).replace(/\.?0+$/, '');
    return lang === 'BN' ? toBengaliNumerals(s || '0') : s || '0';
  };

  const fmtNum = (val?: number, decimals: number = 2): string => {
    if (val === undefined || isNaN(val)) return '0.00';
    const s = formatNumber(val, decimals);
    return lang === 'BN' ? toBengaliNumerals(s) : s;
  };


  const showToast = (msg: string) => {
    setDownloadSuccessMsg(msg);
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  // Production-grade: capture receipt element to canvas with reliable rendering
  const captureReceiptCanvas = async (): Promise<HTMLCanvasElement> => {
    const element = receiptRef.current;
    if (!element) throw new Error('Receipt element not found');

    // Small delay to ensure all fonts and styles are fully painted
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    return canvas;
  };

  const handleDownloadPdf = async () => {
    if (!receiptRef.current) return;
    sound.playClick();
    setIsExportingPdf(true);

    try {
      const canvas = await captureReceiptCanvas();
      const safeName = `Khatian_Roshid_${receiptId}.pdf`;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageW = 210;
      const pageH = 297;
      const margin = 8;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;

      // Calculate proportional image dimensions
      const imgAspect = canvas.height / canvas.width;
      let drawW = maxW;
      let drawH = drawW * imgAspect;

      // Scale down to fit within EXACTLY one page if too tall
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH / imgAspect;
      }

      // Center on page
      const posX = (pageW - drawW) / 2;
      const posY = (pageH - drawH) / 2;

      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', posX, posY, drawW, drawH, undefined, 'FAST');
      pdf.save(safeName);

      sound.playBeep();
      showToast(lang === 'BN' ? '✓ পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : '✓ PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast(lang === 'BN' ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে' : 'PDF generation failed');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJpg = async () => {
    if (!receiptRef.current) return;
    sound.playClick();
    setIsExportingJpg(true);

    try {
      const canvas = await captureReceiptCanvas();
      const safeName = `Khatian_Roshid_${receiptId}.jpg`;

      // Create crisp A4-proportioned canvas (210:297 ratio) with white background
      const a4Width = 1600;
      const a4Height = Math.round(a4Width * (297 / 210)); // 2263px

      const a4Canvas = document.createElement('canvas');
      a4Canvas.width = a4Width;
      a4Canvas.height = a4Height;
      const ctx = a4Canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // Pure solid white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, a4Width, a4Height);

      // Certificate decorative borders
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 4;
      ctx.strokeRect(32, 32, a4Width - 64, a4Height - 64);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, a4Width - 80, a4Height - 80);

      // Scale captured canvas to fit within A4 margins
      const padding = 70;
      const maxW = a4Width - padding * 2;
      const maxH = a4Height - padding * 2;
      const scale = Math.min(maxW / canvas.width, maxH / canvas.height);
      const drawW = canvas.width * scale;
      const drawH = canvas.height * scale;
      const drawX = (a4Width - drawW) / 2;
      const drawY = (a4Height - drawH) / 2;

      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, drawX, drawY, drawW, drawH);

      // Direct reliable download via Data URL (immune to premature revocation bugs)
      const link = document.createElement('a');
      link.download = safeName;
      link.href = a4Canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      sound.playBeep();
      showToast(lang === 'BN' ? '✓ জেপিজি ছবি সফলভাবে ডাউনলোড হয়েছে!' : '✓ JPG image downloaded successfully!');
    } catch (err) {
      console.error('JPG generation error:', err);
      showToast(lang === 'BN' ? 'ছবি তৈরিতে সমস্যা হয়েছে' : 'JPG generation failed');
    } finally {
      setIsExportingJpg(false);
    }
  };

  const handleCopy = () => {
    sound.playClick();
    let text = `=========================================\n`;
    text += `  খতিয়ান হিস্যা ও ভূমি বণ্টন প্রত্যয়নপত্র / KHATIAN CERTIFICATE\n`;
    text += `  রসিদ নং: ${receiptId} | তারিখ: ${currentDateStr}\n`;
    if (khatianNo) text += `  খতিয়ান নং: ${khatianNo} | `;
    if (daagNo) text += `দাগ নং: ${daagNo} | `;
    if (mouza) text += `মৌজা: ${mouza}\n`;
    text += `=========================================\n\n`;

    if (mode === 'SINGLE' && singleData) {
      text += `মোট জমি: ${singleData.totalAcre} একর\n`;
      text += `ব্যক্তির অংশ: ${singleData.personShare}\n`;
      text += `-----------------------------------------\n`;
      text += `• প্রাপ্ত শতাংশ: ${singleData.sotangso.toFixed(4)} শতক\n`;
      text += `• কাঠা: ${singleData.katha.toFixed(3)} কাঠা\n`;
      text += `• বিঘা: ${singleData.bigha.toFixed(4)} বিঘা\n`;
      text += `• বর্গফুট: ${singleData.sqFt.toLocaleString()} Sq.Ft\n`;
      if (landPrice > 0) {
        text += `• বাজার মূল্য: ${formatBDT(singleData.price)}\n`;
      }
    } else if (mode === 'MULTI' && multiData) {
      text += `মোট জমি: ${multiData.totalLand} ${multiData.totalLandUnit} (${multiData.totalSotangso.toFixed(2)} শতক / ${multiData.totalKatha.toFixed(2)} কাঠা)\n`;
      text += `মোট অংশীদার: ${multiData.partners.length} জন\n\n`;
      multiData.partners.forEach((p, idx) => {
        text += `${idx + 1}. ${p.name}: হিস্যা ${((p.shareRatio || 0) * 100).toFixed(2)}%\n`;
        text += `   শতাংশ: ${p.sotangso.toFixed(4)} শতক | কাঠা: ${p.katha.toFixed(3)} | বর্গফুট: ${p.sqFeet.toFixed(1)}\n`;
        if (landPrice > 0) {
          text += `   মূল্য: ${formatBDT(p.price)}\n`;
        }
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ padding: '16px 8px' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        <SkeuoCard style={{ padding: '20px', overflow: 'hidden' }}>
          {/* Top Modal Bar - Action buttons (Hidden when printed) */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid var(--border-rim)',
              paddingBottom: '14px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Scale size={20} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    margin: 0,
                  }}
                >
                  {lang === 'BN'
                    ? 'খতিয়ান হিস্যা ও ভূমি বণ্টন সনদ'
                    : 'Khatian Land Assessment Receipt'}
                </h3>
                <span
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {lang === 'BN' ? '১ পৃষ্ঠায় এ৪ প্রিভিউ ও ডাউনলোড' : 'A4 1-Page Official Receipt'}
                </span>
              </div>
            </div>

            {/* Actions: Print, PDF, JPG, Copy, Close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Print Receipt */}
              <button
                type="button"
                onClick={handlePrint}
                className="header-glass-btn"
                style={{
                  width: 'auto',
                  padding: '0 14px',
                  height: '36px',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  cursor: 'pointer',
                }}
                title={lang === 'BN' ? 'এ৪ ১ পৃষ্ঠায় প্রিন্ট করুন' : 'Print A4 Receipt'}
              >
                <Printer size={15} />
                <span>{lang === 'BN' ? 'প্রিন্ট রসিদ' : 'Print'}</span>
              </button>

              {/* Download PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="header-glass-btn"
                style={{
                  width: 'auto',
                  padding: '0 14px',
                  height: '36px',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer',
                }}
                title={lang === 'BN' ? 'পিডিএফ ফাইল ডাউনলোড করুন' : 'Download PDF'}
              >
                {isExportingPdf ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
                <span>PDF</span>
              </button>

              {/* Download JPG */}
              <button
                type="button"
                onClick={handleDownloadJpg}
                disabled={isExportingJpg}
                className="header-glass-btn"
                style={{
                  width: 'auto',
                  padding: '0 14px',
                  height: '36px',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer',
                }}
                title={lang === 'BN' ? 'জেপিজি ছবি ডাউনলোড করুন' : 'Download JPG'}
              >
                {isExportingJpg ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
                <span>JPG</span>
              </button>

              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="header-glass-btn"
                style={{ height: '36px', padding: '0 10px' }}
                title={lang === 'BN' ? 'টেক্সট কপি করুন' : 'Copy Text'}
              >
                {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="header-glass-btn"
                style={{ height: '36px', padding: '0 10px' }}
                title={lang === 'BN' ? 'বন্ধ করুন' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Download Success Notification Toast */}
          {downloadSuccessMsg && (
            <div
              className="no-print"
              style={{
                marginBottom: '12px',
                padding: '8px 14px',
                background: '#ECFDF5',
                border: '1px solid #10B981',
                borderRadius: '10px',
                color: '#065F46',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={15} />
              <span>{downloadSuccessMsg}</span>
            </div>
          )}

          {/* =========================================================
              THE OFFICIAL PRINTABLE RECEIPT (EXACT A4 1-PAGE LAYOUT)
              ========================================================= */}
          <div
            id="khatian-printable-receipt"
            ref={receiptRef}
            className="khatian-a4-receipt"
            style={{
              background: '#FFFFFF',
              color: '#111827',
              borderRadius: '16px',
              padding: '24px 28px',
              boxSizing: 'border-box',
              border: '2.5px solid #064E3B',
              outline: '1.5px dashed #10B981',
              outlineOffset: '-6px',
              fontFamily: "'Hind Siliguri', 'Outfit', sans-serif",
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}
          >
            {/* Top Official Certificate Header */}
            <div
              style={{
                textAlign: 'center',
                borderBottom: '2px solid #064E3B',
                paddingBottom: '12px',
                marginBottom: '14px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 12px',
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                  borderRadius: '999px',
                  border: '1px solid #10B981',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#065F46',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                <Award size={13} color="#047857" />
                <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত সার্ভে স্ট্যান্ডার্ড</span>
              </div>

              <h2
                style={{
                  fontSize: '21px',
                  fontWeight: 900,
                  color: '#064E3B',
                  margin: '4px 0 2px 0',
                  letterSpacing: '-0.3px',
                }}
              >
                {lang === 'BN'
                  ? 'খতিয়ান ভিত্তিক ভূমি বণ্টন ও জরিপ প্রত্যয়নপত্র'
                  : 'Khatian Land Distribution & Assessment Certificate'}
              </h2>

              <div
                style={{
                  fontSize: '11.5px',
                  color: '#047857',
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  marginBottom: '8px',
                }}
              >
                ডিজিটাল আমিন ও ল্যান্ড রেকর্ড ম্যানেজমেন্ট শাখা • DIGITAL AMIN CERTIFIED SURVEY
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: '#4B5563',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  background: '#F9FAFB',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <span>
                  <strong>রসিদ আইডি:</strong> {receiptId}
                </span>
                <span>
                  <strong>ইস্যুর সময়:</strong> {currentDateStr}
                </span>
                <span>
                  <strong>হিসাব মানদণ্ড:</strong> ১ কাঠা = {fmt(sotangsoPerKatha, 2)} শতক (১ একর = ১০০ শতক)
                </span>
              </div>
            </div>

            {/* Khatian & Document Metadata Row (With "(ঐচ্ছিক)" marks) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: '#F0FDF4',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #A7F3D0',
                marginBottom: '14px',
                fontSize: '12px',
              }}
            >
              <div>
                <span style={{ color: '#065F46', fontWeight: 700 }}>খতিয়ান নং (ঐচ্ছিক):</span>{' '}
                <strong style={{ color: '#111827' }}>
                  {khatianNo ? (lang === 'BN' ? toBengaliNumerals(khatianNo) : khatianNo) : '—'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#065F46', fontWeight: 700 }}>দাগ নং (ঐচ্ছিক):</span>{' '}
                <strong style={{ color: '#111827' }}>
                  {daagNo ? (lang === 'BN' ? toBengaliNumerals(daagNo) : daagNo) : '—'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#065F46', fontWeight: 700 }}>মৌজা (ঐচ্ছিক):</span>{' '}
                <strong style={{ color: '#111827' }}>{mouza || '—'}</strong>
              </div>
              <div>
                <span style={{ color: '#065F46', fontWeight: 700 }}>জরিপের ধরন:</span>{' '}
                <strong style={{ color: '#047857' }}>
                  {mode === 'SINGLE' ? 'একক খতিয়ান হিস্যা' : 'যৌথ খতিয়ান বণ্টন'}
                </strong>
              </div>
            </div>

            {/* Total Land Summary Bar (Strictly Survey Numbers) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #065F46 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '14px',
                display: 'grid',
                gridTemplateColumns: landPrice > 0 ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)',
                gap: '8px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.25)',
              }}
            >
              <div>
                <div style={{ fontSize: '10.5px', opacity: 0.9, fontWeight: 700 }}>মোট জমি (একর)</div>
                <div style={{ fontSize: '16.5px', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                  {mode === 'SINGLE'
                    ? fmt(parseFloat(singleData?.totalAcre || '0'), 3)
                    : multiData?.totalLandUnit === 'ACRE'
                    ? fmt(parseFloat(multiData?.totalLand || '0'), 3)
                    : fmt((multiData?.totalSotangso || 0) / 100, 3)}{' '}
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>একর</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10.5px', opacity: 0.9, fontWeight: 700 }}>মোট শতক/শতাংশ</div>
                <div style={{ fontSize: '16.5px', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                  {mode === 'SINGLE'
                    ? fmt((parseFloat(singleData?.totalAcre || '0')) * 100, 2)
                    : fmt(multiData?.totalSotangso, 2)}{' '}
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>শতক</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10.5px', opacity: 0.9, fontWeight: 700 }}>মোট কাঠা</div>
                <div style={{ fontSize: '16.5px', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                  {mode === 'SINGLE'
                    ? fmt(((parseFloat(singleData?.totalAcre || '0')) * 100) / sotangsoPerKatha, 2)
                    : fmt(multiData?.totalKatha, 2)}{' '}
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>কাঠা</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10.5px', opacity: 0.9, fontWeight: 700 }}>মোট বর্গফুট</div>
                <div style={{ fontSize: '16.5px', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                  {mode === 'SINGLE'
                    ? fmtNum((parseFloat(singleData?.totalAcre || '0')) * 43560, 0)
                    : fmtNum(multiData?.totalSqFt, 0)}{' '}
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>বর্গফুট</span>
                </div>
              </div>

              {landPrice > 0 && (
                <div>
                  <div style={{ fontSize: '10.5px', opacity: 0.9, fontWeight: 700 }}>মোট বাজারদর</div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#FDE047' }}>
                    {mode === 'SINGLE'
                      ? formatBDT(
                          ((parseFloat(singleData?.totalAcre || '0')) * 100) * landPrice
                        )
                      : formatBDT(multiData?.totalPrice || 0)}
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================
                CALCULATION BREAKDOWN (NO FORMULAS - STRICTLY SURVEY NUMBERS)
                ========================================================= */}
            {mode === 'SINGLE' && singleData ? (
              <div style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#064E3B',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={15} color="#047857" />
                  <span>ব্যক্তির প্রাপ্ত হিস্যা ও জমির সুনির্দিষ্ট বিবরণ:</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>ব্যক্তির হিস্যা/অংশ</div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#047857', marginTop: '2px' }}>
                      {singleData.personShare || '১.০০০ (পূর্ণ অংশ)'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>প্রাপ্ত শতক (Sotangso)</div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#111827', marginTop: '2px' }}>
                      {fmt(singleData.sotangso, 4)} <span style={{ fontSize: '11.5px', color: '#4B5563' }}>শতক</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>প্রাপ্ত কাঠা (Katha)</div>
                    <div style={{ fontSize: '17px', fontWeight: 900, color: '#111827', marginTop: '2px' }}>
                      {fmt(singleData.katha, 3)} <span style={{ fontSize: '11.5px', color: '#4B5563' }}>কাঠা</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>প্রাপ্ত বিঘা (Bigha)</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                      {fmt(singleData.bigha, 4)} <span style={{ fontSize: '11px', color: '#4B5563' }}>বিঘা</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>বর্গফুট (Sq. Feet)</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                      {fmtNum(singleData.sqFt, 1)} <span style={{ fontSize: '11px', color: '#4B5563' }}>বর্গফুট</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700 }}>বর্গমিটার (Sq. Meter)</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
                      {fmtNum(singleData.sqM, 1)} <span style={{ fontSize: '11px', color: '#4B5563' }}>বর্গমিটার</span>
                    </div>
                  </div>
                </div>

                {landPrice > 0 && (
                  <div
                    style={{
                      background: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E' }}>
                      ব্যক্তির প্রাপ্ত জমির আনুমানিক বাজার মূল্য:
                    </span>
                    <strong style={{ fontSize: '17px', color: '#B45309', fontFamily: 'Outfit, sans-serif' }}>
                      {formatBDT(singleData.price)}
                    </strong>
                  </div>
                )}
              </div>
            ) : mode === 'MULTI' && multiData ? (
              <div style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#064E3B',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <FileText size={15} color="#047857" />
                  <span>অংশীদারদের সুনির্দিষ্ট বণ্টন তালিকা (Distribution Ledger):</span>
                </div>

                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #D1D5DB',
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '11.5px',
                      textAlign: 'left',
                    }}
                  >
                    <thead>
                      <tr style={{ background: '#F3F4F6', color: '#1F2937', fontWeight: 800, borderBottom: '1.5px solid #D1D5DB' }}>
                        <th style={{ padding: '8px 10px', width: '36px' }}>ক্র.</th>
                        <th style={{ padding: '8px 10px' }}>অংশীদারের নাম</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>হিস্যা / অংশ</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>প্রাপ্ত শতক</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>কাঠা</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>বর্গফুট</th>
                        {landPrice > 0 && (
                          <th style={{ padding: '8px 10px', textAlign: 'right' }}>বাজারদর (৳)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {multiData.partners.map((p, idx) => (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid #E5E7EB',
                            background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                          }}
                        >
                          <td style={{ padding: '7px 10px', fontWeight: 700, color: '#6B7280' }}>
                            {lang === 'BN' ? toBengaliNumerals(String(idx + 1)) : idx + 1}
                          </td>
                          <td style={{ padding: '7px 10px', fontWeight: 800, color: '#111827' }}>
                            {p.name}
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#047857', fontWeight: 700 }}>
                            {((p.shareRatio || 0) * 100).toFixed(2)}%
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                            {fmt(p.sotangso, 4)}
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>
                            {fmt(p.katha, 3)}
                          </td>
                          <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                            {fmtNum(p.sqFeet, 1)}
                          </td>
                          {landPrice > 0 && (
                            <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#B45309' }}>
                              {formatBDT(p.price)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#ECFDF5', borderTop: '2px solid #047857', fontWeight: 900, color: '#064E3B' }}>
                        <td colSpan={2} style={{ padding: '8px 10px' }}>
                          সর্বমোট বণ্টন
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          {fmt(
                            multiData.partners.reduce((sum, p) => sum + (p.shareRatio || 0), 0) * 100,
                            1
                          )}
                          %
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          {fmt(
                            multiData.partners.reduce((sum, p) => sum + (p.sotangso || 0), 0),
                            3
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          {fmt(
                            multiData.partners.reduce((sum, p) => sum + (p.katha || 0), 0),
                            2
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          {fmtNum(
                            multiData.partners.reduce((sum, p) => sum + (p.sqFeet || 0), 0),
                            0
                          )}
                        </td>
                        {landPrice > 0 && (
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            {formatBDT(
                              multiData.partners.reduce((sum, p) => sum + (p.price || 0), 0)
                            )}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Official Surveyor & Recipient Signature Block */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px dashed #D1D5DB',
                fontSize: '11px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ height: '36px' }} />
                <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: '4px', fontWeight: 700, color: '#4B5563' }}>
                  জমির মালিক / আবেদনকারীর স্বাক্ষর
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: '#ECFDF5',
                    border: '1.5px solid #10B981',
                    color: '#047857',
                    fontWeight: 800,
                    fontSize: '11px',
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>ডিজিটাল আমিন ভেরিফাইড</span>
                </div>
                <div style={{ fontSize: '9.5px', color: '#6B7280', marginTop: '4px' }}>
                  সফটওয়্যার প্রস্তুতকৃত নিখুঁত রেকর্ড
                </div>
              </div>

              <div>
                <div style={{ height: '36px' }} />
                <div style={{ borderTop: '1px solid #9CA3AF', paddingTop: '4px', fontWeight: 800, color: '#047857' }}>
                  ডিজিটাল আমিন / সার্ভেয়ারের সিল ও স্বাক্ষর
                </div>
              </div>
            </div>

            {/* Verification Footer Note */}
            <div
              style={{
                fontSize: '9.5px',
                color: '#6B7280',
                textAlign: 'center',
                marginTop: '10px',
                paddingTop: '6px',
                borderTop: '1px solid #F3F4F6',
              }}
            >
              * এই প্রত্যয়নপত্রটি গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত ডিজিটাল ভূমি জরিপ মানদণ্ডের (১ একর = ১০০ শতক) আলোকে প্রণীত। সীমানা বা খতিয়ান বিরোধ নিষ্পত্তিতে মূল পর্চা ও মৌজা নকশার সাথে যাচাইযোগ্য।
            </div>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
