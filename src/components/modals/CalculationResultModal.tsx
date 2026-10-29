import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Award,
  Sparkles,
  Coins,
  FileDown,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  AppLanguage,
  AppUnit,
  CalculationResult,
  LandShape,
  PriceUnit,
  TriangleMethod,
  CanvasPoint,
} from '../../types';
import { getTranslation } from '../../lib/translations';
import {
  formatBDT,
  formatNumber,
  toBengaliNumerals,
  computeTotalPrice,
} from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { sound } from '../../lib/sound';

interface CalculationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  shape: LandShape | 'KHATIAN' | 'TRIANGULATION' | string;
  inputs: Record<string, string>;
  unit: AppUnit;
  triangleMethod?: TriangleMethod;
  freeformPoints?: CanvasPoint[];
  landPrice: number;
  priceUnit: PriceUnit;
  sotangsoPerKatha: number;
  lang: AppLanguage;
  autoAction?: 'PRINT' | 'PDF' | 'JPG' | null;
  historyDateStr?: string;
  historyReceiptId?: string;
}

export const CalculationResultModal: React.FC<CalculationResultModalProps> = ({
  isOpen,
  onClose,
  result,
  shape,
  inputs,
  unit,
  triangleMethod,
  freeformPoints,
  landPrice,
  priceUnit,
  sotangsoPerKatha,
  lang,
  autoAction,
  historyDateStr,
  historyReceiptId,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const printableRef = useRef<HTMLDivElement | null>(null);

  const receiptId = useMemo(
    () =>
      historyReceiptId ||
      `JP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    [isOpen, historyReceiptId]
  );

  const currentDateStr = useMemo(() => {
    if (historyDateStr) return historyDateStr;
    return new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lang, isOpen, historyDateStr]);

  const unitLabel = unit === 'FEET' ? (lang === 'BN' ? 'ফুট' : 'ft') : (lang === 'BN' ? 'মিটার' : 'm');

  const fmt = (val?: number, decimals: number = 3): string => {
    if (val === undefined || isNaN(val)) return '0.00';
    const s = val.toFixed(decimals);
    return lang === 'BN' ? toBengaliNumerals(s) : s;
  };

  const fmtInt = (val?: number): string => {
    if (val === undefined || isNaN(val)) return '0.00';
    const s = formatNumber(val, 2);
    return lang === 'BN' ? toBengaliNumerals(s) : s;
  };

  const shapeTitleMap: Record<string, { en: string; bn: string }> = {
    RECTANGLE: { en: 'Rectangle', bn: 'আয়তক্ষেত্র' },
    SQUARE: { en: 'Square', bn: 'বর্গক্ষেত্র' },
    TRIANGLE: { en: 'Triangle', bn: 'ত্রিভুজ' },
    RHOMBUS: { en: 'Rhombus', bn: 'রম্বস' },
    PARALLELOGRAM: { en: 'Parallelogram', bn: 'সামান্তরিক' },
    TRAPEZIUM: { en: 'Trapezium', bn: 'ট্রাপিজিয়াম' },
    PENTAGON: { en: 'Pentagon', bn: 'পঞ্চভুজ' },
    HEXAGON: { en: 'Hexagon', bn: 'ষড়ভুজ' },
    CUBE: { en: 'Cube (3D / Earth)', bn: 'কিউব / মাটিকাটা' },
    QUADRILATERAL: { en: 'Irregular Quadrilateral', bn: 'অনিয়মিত চতুর্ভুজ' },
    FREEFORM: { en: 'Custom Canvas Polygon', bn: 'কাস্টম ক্যানভাস ড্রয়িং' },
    KHATIAN: { en: 'Khatian Land Assessment', bn: 'খতিয়ান হিস্যা ও বণ্টন' },
    TRIANGULATION: { en: 'Triangulation Survey', bn: 'ত্রিভুজায়ন জরিপ' },
  };

  const currentShapeTitle =
    lang === 'BN' ? shapeTitleMap[shape]?.bn || shape : shapeTitleMap[shape]?.en || shape;

  // Build inputs summary list
  const getInputItems = (): { label: string; value: string }[] => {
    const list: { label: string; value: string }[] = [];

    if (shape === 'RECTANGLE') {
      if (inputs.length_1) list.push({ label: lang === 'BN' ? 'উত্তর বাহু (দৈর্ঘ্য ১)' : 'Length 1 (North)', value: `${inputs.length_1} ${unitLabel}` });
      if (inputs.length_2) list.push({ label: lang === 'BN' ? 'দক্ষিণ বাহু (দৈর্ঘ্য ২)' : 'Length 2 (South)', value: `${inputs.length_2} ${unitLabel}` });
      if (inputs.width_1) list.push({ label: lang === 'BN' ? 'পশ্চিম বাহু (প্রস্থ ১)' : 'Width 1 (West)', value: `${inputs.width_1} ${unitLabel}` });
      if (inputs.width_2) list.push({ label: lang === 'BN' ? 'পূর্ব বাহু (প্রস্থ ২)' : 'Width 2 (East)', value: `${inputs.width_2} ${unitLabel}` });
    } else if (shape === 'TRIANGLE') {
      if (triangleMethod === 'BASE_HEIGHT') {
        if (inputs.base) list.push({ label: lang === 'BN' ? 'ভূমি (Base)' : 'Base', value: `${inputs.base} ${unitLabel}` });
        if (inputs.height) list.push({ label: lang === 'BN' ? 'উচ্চতা (Height)' : 'Height', value: `${inputs.height} ${unitLabel}` });
      } else {
        if (inputs.side_a) list.push({ label: lang === 'BN' ? 'বাহু ক (A)' : 'Side A', value: `${inputs.side_a} ${unitLabel}` });
        if (inputs.side_b) list.push({ label: lang === 'BN' ? 'বাহু খ (B)' : 'Side B', value: `${inputs.side_b} ${unitLabel}` });
        if (inputs.side_c) list.push({ label: lang === 'BN' ? 'বাহু গ (C)' : 'Side C', value: `${inputs.side_c} ${unitLabel}` });
      }
    } else if (shape === 'QUADRILATERAL') {
      if (inputs.side_a) list.push({ label: lang === 'BN' ? 'বাহু ক (A)' : 'Side A', value: `${inputs.side_a} ${unitLabel}` });
      if (inputs.side_b) list.push({ label: lang === 'BN' ? 'বাহু খ (B)' : 'Side B', value: `${inputs.side_b} ${unitLabel}` });
      if (inputs.side_c) list.push({ label: lang === 'BN' ? 'বাহু গ (C)' : 'Side C', value: `${inputs.side_c} ${unitLabel}` });
      if (inputs.side_d) list.push({ label: lang === 'BN' ? 'বাহু ঘ (D)' : 'Side D', value: `${inputs.side_d} ${unitLabel}` });
      if (inputs.diag_e) list.push({ label: lang === 'BN' ? 'কর্ণ (Diagonal E)' : 'Diagonal E', value: `${inputs.diag_e} ${unitLabel}` });
    } else if (shape === 'PENTAGON') {
      ['side_1', 'side_2', 'side_3', 'side_4', 'side_5'].forEach((k, i) => {
        if (inputs[k]) list.push({ label: lang === 'BN' ? `বাহু ${toBengaliNumerals(i + 1)}` : `Side ${i + 1}`, value: `${inputs[k]} ${unitLabel}` });
      });
      if (inputs.diag_1_pent) list.push({ label: lang === 'BN' ? 'কর্ণ ১' : 'Diagonal 1', value: `${inputs.diag_1_pent} ${unitLabel}` });
      if (inputs.diag_2_pent) list.push({ label: lang === 'BN' ? 'কর্ণ ২' : 'Diagonal 2', value: `${inputs.diag_2_pent} ${unitLabel}` });
    } else if (shape === 'HEXAGON') {
      if (inputs.side) list.push({ label: lang === 'BN' ? 'প্রতি বাহু' : 'Side Length', value: `${inputs.side} ${unitLabel}` });
    } else if (shape === 'FREEFORM') {
      list.push({
        label: lang === 'BN' ? 'মোট সীমানা পয়েন্ট' : 'Total Boundary Pins',
        value: `${freeformPoints?.length || 0} ${lang === 'BN' ? 'টি' : 'pins'}`,
      });
    }

    if (list.length === 0) {
      if (inputs.description) {
        list.push({
          label: lang === 'BN' ? 'পরিমাপ বিবরণ' : 'Measurement Info',
          value: inputs.description,
        });
      } else {
        Object.entries(inputs).forEach(([k, v]) => {
          if (v && v !== '0') {
            list.push({ label: k, value: String(v) });
          }
        });
      }
    }

    return list;
  };

  const inputItems = getInputItems();

  // Total Land Valuation
  const calculatedTotalPrice = computeTotalPrice(result, landPrice, priceUnit);
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
      ? 'শতাংশ / শতক'
      : 'Sotangso';

  // Copy full summary to clipboard
  const handleCopy = () => {
    sound.playClick();
    const textLines = [
      `==============================`,
      `  ${lang === 'BN' ? 'ভূমি পরিমাপের পূর্ণাঙ্গ প্রত্যয়নপত্র' : 'Land Survey Certificate Summary'}`,
      `  রসিদ নং: ${receiptId} | তারিখ: ${currentDateStr}`,
      `==============================`,
      `${lang === 'BN' ? 'জমির আকার:' : 'Shape:'} ${currentShapeTitle}`,
      `${lang === 'BN' ? 'ব্যবহৃত একক:' : 'Unit:'} ${unit === 'FEET' ? 'Feet (ফুট)' : 'Meters (মিটার)'}`,
      ``,
      `${lang === 'BN' ? 'প্রদত্ত পরিমাপসমূহ:' : 'Input Dimensions:'}`,
      ...inputItems.map((item) => `• ${item.label}: ${item.value}`),
      ``,
      `--- ${lang === 'BN' ? 'জমির ক্ষেত্রফল (বাংলাদেশ স্ট্যান্ডার্ড)' : 'Land Area Metrics'} ---`,
      `• ${lang === 'BN' ? 'শতাংশ / শতক:' : 'Sotangso / Decimal:'} ${result.sotangso.toFixed(4)}`,
      `• ${lang === 'BN' ? 'কাঠা:' : 'Katha:'} ${result.katha.toFixed(4)} (${lang === 'BN' ? `১ কাঠা = ${sotangsoPerKatha.toFixed(2)} শতক` : `1 Katha = ${sotangsoPerKatha.toFixed(2)} Decimals`})`,
      `• ${lang === 'BN' ? 'বিঘা:' : 'Bigha:'} ${result.bigha.toFixed(4)}`,
      `• ${lang === 'BN' ? 'একর:' : 'Acre:'} ${result.acre.toFixed(4)}`,
      `• ${lang === 'BN' ? 'মোট বর্গফুট:' : 'Sq. Feet:'} ${result.sqFeet.toFixed(2)}`,
      `• ${lang === 'BN' ? 'মোট বর্গমিটার:' : 'Sq. Meters:'} ${result.sqMeters.toFixed(2)}`,
      `• ${lang === 'BN' ? 'ছটাক:' : 'Chhatak:'} ${(result.chhatak || 0).toFixed(2)}`,
      `• ${lang === 'BN' ? 'হেক্টর:' : 'Hectare:'} ${(result.hectare || 0).toFixed(4)}`,
      ``,
    ];

    if (landPrice > 0) {
      textLines.push(
        `--- ${lang === 'BN' ? 'আনুমানিক বাজার মূল্য' : 'Estimated Market Valuation'} ---`,
        `• ${lang === 'BN' ? 'রেট:' : 'Rate:'} ৳ ${landPrice.toLocaleString()} ${lang === 'BN' ? `প্রতি ${priceUnitLabel}` : `per ${priceUnitLabel}`}`,
        `• ${lang === 'BN' ? 'মোট আনুমানিক মূল্য:' : 'Total Value:'} ${formatBDT(calculatedTotalPrice)}`,
        ``
      );
    }

    textLines.push(
      `------------------------------`,
      `Calculated via Jomi Porimap Total Station`,
      `https://rubayetkhan.is-best.net`
    );

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    sound.playClick();
    const element = printableRef.current;
    if (!element) {
      window.print();
      return;
    }

    // Create an isolated iframe for clean, reliable 1-page receipt printing without website chrome
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Inherit styles & fonts from main window
    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Jomi Porimap Certificate - ${receiptId}</title>
          ${styleLinks}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #FFFFFF !important;
              color: #111827 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Hind Siliguri', 'Outfit', sans-serif !important;
            }
            #survey-printable-receipt {
              display: block !important;
              width: 100% !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 300);
  };

  // Production-grade: capture printable element to canvas with reliable rendering
  const capturePrintableCanvas = async (): Promise<HTMLCanvasElement> => {
    const element = printableRef.current;
    if (!element) throw new Error('Printable element not found');

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
    if (!printableRef.current) return;
    sound.playClick();
    setIsExportingPdf(true);
    try {
      const canvas = await capturePrintableCanvas();
      const safeName = `Jomi_Porimap_Roshid_${receiptId}.pdf`;

      // Proper sizing: Fit PDF page dimensions proportionally to the receipt content
      // with standard 8mm margins all around, eliminating massive top/bottom empty gaps
      const marginMm = 8;
      const pageWMm = 210; // Standard 210mm width (A4 width)
      const drawWMm = pageWMm - marginMm * 2; // 194mm content width
      const imgAspect = canvas.height / canvas.width;
      const drawHMm = drawWMm * imgAspect;
      const pageHMm = drawHMm + marginMm * 2; // Exact proportional page height

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWMm, pageHMm],
        compress: true,
      });

      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', marginMm, marginMm, drawWMm, drawHMm, undefined, 'FAST');
      pdf.save(safeName);

      sound.playBeep();
      setDownloadToast(lang === 'BN' ? '✓ পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : '✓ PDF downloaded successfully!');
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (err) {
      console.error('PDF export error:', err);
      setDownloadToast(lang === 'BN' ? 'পিডিএফ ডাউনলোডে সমস্যা হয়েছে' : 'PDF download failed');
      setTimeout(() => setDownloadToast(null), 3500);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJpg = async () => {
    if (!printableRef.current) return;
    sound.playClick();
    setIsExportingJpg(true);
    try {
      const canvas = await capturePrintableCanvas();
      const safeName = `Jomi_Porimap_Roshid_${receiptId}.jpg`;

      // Proper sizing: Fit canvas to the exact captured certificate height + balanced framing margin
      // Eliminates massive vertical empty space above and below the certificate
      const margin = 28;
      const finalWidth = canvas.width + margin * 2;
      const finalHeight = canvas.height + margin * 2;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = finalWidth;
      exportCanvas.height = finalHeight;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // Pure solid white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, finalWidth, finalHeight);

      // Certificate decorative borders (evenly balanced on all 4 sides)
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, finalWidth - 20, finalHeight - 20);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(16, 16, finalWidth - 32, finalHeight - 32);

      // Draw the certificate precisely within the margins
      ctx.drawImage(canvas, margin, margin, canvas.width, canvas.height);

      // Direct reliable download via Data URL (immune to premature revocation bugs)
      const link = document.createElement('a');
      link.download = safeName;
      link.href = exportCanvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      sound.playBeep();
      setDownloadToast(lang === 'BN' ? '✓ জেপিজি ছবি সফলভাবে ডাউনলোড হয়েছে!' : '✓ JPG downloaded successfully!');
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (err) {
      console.error('JPG export error:', err);
      setDownloadToast(lang === 'BN' ? 'ছবি ডাউনলোডে সমস্যা হয়েছে' : 'JPG download failed');
      setTimeout(() => setDownloadToast(null), 3500);
    } finally {
      setIsExportingJpg(false);
    }
  };

  // Automatically trigger requested action (Print, PDF, JPG) if opened from History with direct action
  useEffect(() => {
    if (!isOpen || !autoAction) return;

    const timer = setTimeout(() => {
      if (autoAction === 'PRINT') {
        handlePrint();
      } else if (autoAction === 'PDF') {
        handleDownloadPdf();
      } else if (autoAction === 'JPG') {
        handleDownloadJpg();
      }
    }, 550);

    return () => clearTimeout(timer);
  }, [isOpen, autoAction]);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ padding: '16px 8px' }}>
      <div
        className="modal-content result-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        <SkeuoCard className="result-modal-card" style={{ padding: '20px', overflow: 'hidden' }}>
          {/* Top Modal Controls Header (Hidden in Print & Exports) */}
          <div
            className="no-print modal-top-bar"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '180px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Award size={22} />
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: 0,
                  }}
                >
                  <span>{getTranslation('calc_result_modal_title', lang)}</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: 'rgba(46, 125, 50, 0.15)',
                      color: '#2E7D32',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                    }}
                  >
                    📐 {currentShapeTitle}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    • {unit === 'FEET' ? (lang === 'BN' ? 'ফুট ভিত্তিক' : 'Feet Base') : (lang === 'BN' ? 'মিটার ভিত্তিক' : 'Meters Base')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions at Top */}
            <div className="modal-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="header-glass-btn modal-action-btn"
                style={{
                  width: 'auto',
                  padding: '0 12px',
                  height: '36px',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                }}
                title={lang === 'BN' ? 'প্রিন্ট করুন' : 'Print'}
              >
                <Printer size={15} />
                <span>{lang === 'BN' ? 'প্রিন্ট' : 'Print'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="header-glass-btn modal-action-btn"
                style={{
                  width: 'auto',
                  padding: '0 14px',
                  height: '36px',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer',
                }}
                title={lang === 'BN' ? 'পিডিএফ রসিদ ডাউনলোড করুন' : 'Download PDF'}
              >
                {isExportingPdf ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                disabled={isExportingJpg}
                className="header-glass-btn modal-action-btn"
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

              <button
                type="button"
                onClick={onClose}
                className="header-glass-btn modal-close-btn"
                style={{ height: '36px', padding: '0 10px', width: '36px' }}
                title={lang === 'BN' ? 'বন্ধ করুন' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Download Notification Toast Banner */}
          {downloadToast && (
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
              <Check size={16} color="#059669" />
              <span>{downloadToast}</span>
            </div>
          )}

          {/* =========================================================
              THE OFFICIAL PRINTABLE RECEIPT (EXACT A4 1-PAGE LAYOUT)
              ========================================================= */}
          <div
            id="survey-printable-receipt"
            ref={printableRef}
            className="survey-receipt-paper"
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
              className="cert-header"
              style={{
                textAlign: 'center',
                borderBottom: '2px solid #064E3B',
                paddingBottom: '12px',
                marginBottom: '14px',
                position: 'relative',
              }}
            >
              <div
                className="cert-badge"
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
                <span>গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত ডিজিটাল সার্ভে স্ট্যান্ডার্ড</span>
              </div>

              <h2
                className="cert-title"
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#064E3B',
                  margin: '4px 0 2px 0',
                  letterSpacing: '-0.3px',
                }}
              >
                {lang === 'BN'
                  ? 'ভূমি পরিমাপ ও এলাকা নির্ধারণ প্রত্যয়নপত্র'
                  : 'Land Survey Measurement & Area Determination Certificate'}
              </h2>

              <div
                className="cert-subtitle"
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
                className="cert-meta-row"
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
                  <strong>জমির আকার:</strong> {currentShapeTitle}
                </span>
                <span>
                  <strong>হিসাব মানদণ্ড:</strong> ১ কাঠা = {fmt(sotangsoPerKatha, 2)} শতক (১ একর = ১০০ শতক)
                </span>
              </div>
            </div>

            {/* Input Dimensions Summary Bar */}
            {inputItems.length > 0 && (
              <div
                style={{
                  background: '#F9FAFB',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#065F46',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '6px',
                  }}
                >
                  {getTranslation('input_summary', lang)}:
                </div>
                <div
                  className="cert-inputs-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {inputItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#FFFFFF',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{item.label}</span>
                      <strong style={{ fontSize: '13px', color: '#064E3B' }}>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Spotlight Card: Sotangso / Decimal */}
            <div
              className="cert-spotlight-card"
              style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #022c22 100%)',
                color: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px 20px',
                border: '1.5px solid #10B981',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '14px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={16} color="#34D399" />
                  <span>{getTranslation('sotangso', lang)} (শতাংশ / শতক / ডেসিমেল)</span>
                </div>
                <div
                  style={{
                    fontSize: 'clamp(28px, 6vw, 36px)',
                    fontWeight: 900,
                    fontFamily: 'Outfit, Hind Siliguri, monospace',
                    letterSpacing: '-0.5px',
                    color: '#34D399',
                    lineHeight: 1.1,
                    marginTop: '2px',
                  }}
                >
                  {fmt(result.sotangso, 4)}
                </div>
                <div style={{ fontSize: '11px', color: '#D1FAE5', marginTop: '2px' }}>
                  {lang === 'BN' ? '১ শতাংশ = ৪৩৫.৬০ বর্গফুট (বর্গমিটার ৪০.৪৬)' : '1 Sotangso = 435.60 Sq.Ft'}
                </div>
              </div>

              <div
                className="cert-spotlight-katha"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '11px', color: '#A7F3D0', fontWeight: 700 }}>
                  {getTranslation('katha', lang)}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    fontFamily: 'Outfit, sans-serif',
                    color: '#FFFFFF',
                  }}
                >
                  {fmt(result.katha, 3)}
                </div>
                <div style={{ fontSize: '10px', color: '#D1FAE5' }}>
                  {lang === 'BN'
                    ? `(১ কাঠা = ${toBengaliNumerals(sotangsoPerKatha.toFixed(2))} শতক)`
                    : `(1 Katha = ${sotangsoPerKatha.toFixed(2)} Decimals)`}
                </div>
              </div>
            </div>

            {/* Core Units Grid (Bigha, Acre, Sq.Ft, Sq.M) */}
            <div
              className="cert-units-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {/* Bigha */}
              <div
                className="cert-unit-box"
                style={{
                  background: '#F9FAFB',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563' }}>
                  🌾 {getTranslation('bigha', lang)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#111827', marginTop: '2px' }}>
                  {fmt(result.bigha, 4)}
                </div>
                <div style={{ fontSize: '9.5px', color: '#6B7280' }}>
                  {lang === 'BN' ? '২০ কাঠা / ৩৩.০৬ শতক' : '20 Katha / 33.06 Dec.'}
                </div>
              </div>

              {/* Acre */}
              <div
                className="cert-unit-box"
                style={{
                  background: '#F9FAFB',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563' }}>
                  🏞️ {getTranslation('acre', lang)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#111827', marginTop: '2px' }}>
                  {fmt(result.acre, 4)}
                </div>
                <div style={{ fontSize: '9.5px', color: '#6B7280' }}>
                  {lang === 'BN' ? '১০০ শতক / ৩.০২৫ বিঘা' : '100 Decimals / 3.025 Bigha'}
                </div>
              </div>

              {/* Total Sq. Feet */}
              <div
                className="cert-unit-box"
                style={{
                  background: '#F9FAFB',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563' }}>
                  📏 {getTranslation('sq_feet', lang)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>
                  {fmtInt(result.sqFeet)}
                </div>
                <div style={{ fontSize: '9.5px', color: '#6B7280' }}>
                  {lang === 'BN' ? 'মোট বর্গফুট' : 'Square Feet'}
                </div>
              </div>

              {/* Total Sq. Meters */}
              <div
                className="cert-unit-box"
                style={{
                  background: '#F9FAFB',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563' }}>
                  🌐 {getTranslation('sq_meters', lang)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>
                  {fmtInt(result.sqMeters)}
                </div>
                <div style={{ fontSize: '9.5px', color: '#6B7280' }}>
                  {lang === 'BN' ? 'মোট বর্গমিটার' : 'Square Meters'}
                </div>
              </div>
            </div>

            {/* Traditional units: Chhatak & Hectare */}
            <div
              className="cert-traditional-grid"
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                background: '#F3F4F6',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '11.5px',
                marginBottom: '14px',
              }}
            >
              <div style={{ flex: 1, minWidth: '130px' }}>
                <span style={{ color: '#4B5563' }}>📐 {getTranslation('chhatak', lang)}: </span>
                <strong style={{ color: '#111827' }}>{fmt(result.chhatak, 2)}</strong>
                <span style={{ fontSize: '10.5px', color: '#6B7280' }}> (১৬ ছটাক = ১ কাঠা)</span>
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <span style={{ color: '#4B5563' }}>🗺️ {getTranslation('hectare', lang)}: </span>
                <strong style={{ color: '#111827' }}>{fmt(result.hectare, 4)}</strong>
                <span style={{ fontSize: '10.5px', color: '#6B7280' }}> (২.৪৭ একর)</span>
              </div>
            </div>

            {/* Land Price / Financial Valuation Card */}
            {landPrice > 0 && (
              <div
                className="cert-valuation-card"
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  border: '1.5px solid #F59E0B',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Coins size={15} />
                    <span>{getTranslation('total_market_value', lang)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(20px, 4.5vw, 26px)',
                      fontWeight: 900,
                      color: '#78350F',
                      marginTop: '2px',
                    }}
                  >
                    {formatBDT(calculatedTotalPrice)}
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #FCD34D',
                    textAlign: 'right',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: '#92400E' }}>
                    {getTranslation('applied_rate', lang)}:
                  </div>
                  <strong style={{ fontSize: '13px', color: '#78350F' }}>
                    ৳ {landPrice.toLocaleString()} / {priceUnitLabel}
                  </strong>
                </div>
              </div>
            )}

            {/* Official Verification Signatures & Seal */}
            <div
              className="cert-signatures-grid"
              style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid #E5E7EB',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ height: '36px', borderBottom: '1.5px dashed #9CA3AF', margin: '0 12px 6px 12px' }} />
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#111827' }}>ডিজিটাল আমিন জরিপকারী</div>
                <div style={{ fontSize: '9.5px', color: '#6B7280' }}>স্বাক্ষর ও আইডি সিল</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  className="seal-icon-box"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '2px solid #064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ECFDF5',
                    color: '#064E3B',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#064E3B', marginTop: '4px' }}>
                  যাচাইকৃত প্রত্যয়নপত্র
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280' }}>ISO & BSTI স্ট্যান্ডার্ড</div>
              </div>

              <div>
                <div style={{ height: '36px', borderBottom: '1.5px dashed #9CA3AF', margin: '0 12px 6px 12px' }} />
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#111827' }}>ভূমি মালিক / আবেদনকারী</div>
                <div style={{ fontSize: '9.5px', color: '#6B7280' }}>গ্রহণকারীর স্বাক্ষর</div>
              </div>
            </div>

            {/* Official Footer Disclaimer */}
            <div
              style={{
                marginTop: '12px',
                paddingTop: '8px',
                borderTop: '1px solid #F3F4F6',
                textAlign: 'center',
                fontSize: '9.5px',
                color: '#6B7280',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              <span>ডিজিটাল আমিন অটোমেটেড সার্ভে সিস্টেম • www.rubayetkhan.is-best.net</span>
              <span>পরিমাপ পদ্ধতি: Total Station Algorithmic Computation</span>
            </div>
          </div>

          {/* Action Buttons (outside printableRef - not captured in exports) */}
          <div className="no-print cert-bottom-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button
              type="button"
              onClick={handleCopy}
              className="rocker-btn active-feet copy-btn"
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? (lang === 'BN' ? 'কপি হয়েছে!' : 'Copied!') : getTranslation('copy_results', lang)}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="rocker-btn"
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                border: '1px solid var(--border-rim)',
                background: 'var(--surface-top)',
                color: 'var(--text-main)',
              }}
            >
              <Printer size={18} />
              <span>{getTranslation('print_receipt', lang)}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="rocker-btn"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: '1px solid #10B981',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.2) 100%)',
                color: '#047857',
              }}
              title={lang === 'BN' ? 'পিডিএফ ফাইল ডাউনলোড' : 'Download PDF'}
            >
              {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJpg}
              disabled={isExportingJpg}
              className="rocker-btn"
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: '1px solid #F59E0B',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.2) 100%)',
                color: '#B45309',
              }}
              title={lang === 'BN' ? 'জেপিজি ছবি ডাউনলোড' : 'Download JPG'}
            >
              {isExportingJpg ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
              <span>JPG</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rocker-btn"
              style={{
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                border: '1px solid var(--border-rim)',
                background: 'var(--surface-plate)',
                color: 'var(--text-muted)',
              }}
            >
              {getTranslation('close', lang)}
            </button>
          </div>
        </SkeuoCard>
      </div>
    </div>
  );
};
