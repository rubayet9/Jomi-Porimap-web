import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
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
  FileText,
  RotateCcw,
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
} from '../../types';
import { getTranslation } from '../../lib/translations';
import {
  formatBDT,
  formatNumber,
  toBengaliNumerals,
  computeTotalPrice,
} from '../../lib/calculations';
import { sound } from '../../lib/sound';

export interface SurveyCertificateData {
  result: CalculationResult;
  shape: LandShape | 'KHATIAN' | 'TRIANGULATION' | string;
  inputs: Record<string, string>;
  unit: AppUnit;
  triangleMethod?: TriangleMethod;
  landPrice: number;
  priceUnit: PriceUnit;
  sotangsoPerKatha: number;
  receiptId?: string;
  dateStr?: string;
  autoAction?: 'PRINT' | 'PDF' | 'JPG' | null;
}

interface SurveyCertificatePageProps {
  data: SurveyCertificateData;
  lang: AppLanguage;
  onBack: () => void;
}

export const SurveyCertificatePage: React.FC<SurveyCertificatePageProps> = ({
  data,
  lang,
  onBack,
}) => {
  const {
    result,
    shape,
    inputs,
    unit,
    triangleMethod,
    landPrice,
    priceUnit,
    sotangsoPerKatha,
    receiptId: initialReceiptId,
    dateStr: initialDateStr,
    autoAction,
  } = data;

  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const printableRef = useRef<HTMLDivElement | null>(null);

  const receiptId = useMemo(
    () =>
      initialReceiptId ||
      `JP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    [initialReceiptId]
  );

  const currentDateStr = useMemo(() => {
    if (initialDateStr) return initialDateStr;
    return new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lang, initialDateStr]);

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

    // Create an isolated iframe for clean, reliable 1-page A4 printing
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
            .no-print {
              display: none !important;
            }
            #survey-printable-receipt {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              border: 2px solid #064E3B !important;
              outline: 1.5px dashed #10B981 !important;
              outline-offset: -5px !important;
              padding: 20px 24px !important;
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
    }, 350);
  };

  // High precision capture of A4 sheet for both mobile & desktop
  const captureA4Canvas = async (): Promise<HTMLCanvasElement> => {
    const element = printableRef.current;
    if (!element) throw new Error('Printable element not found');

    // Wait a brief moment to ensure fonts and styles are fully painted
    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp high-DPI resolution
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      scrollX: 0,
      scrollY: 0,
    });
    return canvas;
  };

  const handleDownloadPdf = async () => {
    sound.playClick();
    setIsExportingPdf(true);
    try {
      const canvas = await captureA4Canvas();
      const safeName = `Jomi_Porimap_Certificate_${receiptId}.pdf`;

      // Standard A4 dimensions in mm: 210 x 297
      const pageWMm = 210;
      const pageHMm = 297;
      const marginMm = 8;
      const printableWMm = pageWMm - marginMm * 2; // 194mm
      const printableHMm = pageHMm - marginMm * 2; // 281mm

      const imgAspect = canvas.height / canvas.width;
      let drawWMm = printableWMm;
      let drawHMm = drawWMm * imgAspect;

      // If height overflows A4 page, scale down proportionally to fit 1-page A4 perfectly
      if (drawHMm > printableHMm) {
        drawHMm = printableHMm;
        drawWMm = drawHMm / imgAspect;
      }

      const offsetX = marginMm + (printableWMm - drawWMm) / 2;
      const offsetY = marginMm;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', offsetX, offsetY, drawWMm, drawHMm, undefined, 'FAST');
      pdf.save(safeName);

      sound.playBeep();
      setDownloadToast(lang === 'BN' ? '✓ A4 পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : '✓ A4 PDF downloaded successfully!');
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
    sound.playClick();
    setIsExportingJpg(true);
    try {
      const canvas = await captureA4Canvas();
      const safeName = `Jomi_Porimap_Certificate_${receiptId}.jpg`;

      // Frame with balanced border in standard A4 proportion
      const borderPadding = 24;
      const finalWidth = canvas.width + borderPadding * 2;
      const finalHeight = canvas.height + borderPadding * 2;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = finalWidth;
      exportCanvas.height = finalHeight;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // Pure solid white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, finalWidth, finalHeight);

      // Certificate outer emerald border
      ctx.strokeStyle = '#064E3B';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, finalWidth - 20, finalHeight - 20);

      // Inner thin green border
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(16, 16, finalWidth - 32, finalHeight - 32);

      // Draw the crisp certificate precisely inside the framing borders
      ctx.drawImage(canvas, borderPadding, borderPadding, canvas.width, canvas.height);

      // Download via high quality JPEG
      const link = document.createElement('a');
      link.download = safeName;
      link.href = exportCanvas.toDataURL('image/jpeg', 0.96);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      sound.playBeep();
      setDownloadToast(lang === 'BN' ? '✓ A4 জেপিজি ছবি সফলভাবে ডাউনলোড হয়েছে!' : '✓ A4 JPG downloaded successfully!');
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (err) {
      console.error('JPG export error:', err);
      setDownloadToast(lang === 'BN' ? 'ছবি ডাউনলোডে সমস্যা হয়েছে' : 'JPG download failed');
      setTimeout(() => setDownloadToast(null), 3500);
    } finally {
      setIsExportingJpg(false);
    }
  };

  // Automatically trigger requested action (Print, PDF, JPG) if opened with autoAction
  useEffect(() => {
    if (!autoAction) return;

    const timer = setTimeout(() => {
      if (autoAction === 'PRINT') {
        handlePrint();
      } else if (autoAction === 'PDF') {
        handleDownloadPdf();
      } else if (autoAction === 'JPG') {
        handleDownloadJpg();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [autoAction]);

  return (
    <div className="certificate-page-root" style={{ minHeight: '100vh', background: '#F1F5F9', paddingBottom: '60px' }}>
      {/* Top Floating Control Bar */}
      <div
        className="certificate-page-toolbar no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #CBD5E1',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '12px 18px',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="skeuo-btn"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 800,
              gap: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#1E293B',
            }}
          >
            <ArrowLeft size={16} />
            <span>{lang === 'BN' ? 'অ্যাপে ফিরে যান' : 'Back to App'}</span>
          </button>

          {/* Certificate Title in toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#064E3B',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: '6px',
                letterSpacing: '0.4px',
              }}
            >
              A4 CERTIFICATE
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
              {receiptId}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #94A3B8',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <Printer size={15} />
              <span>{lang === 'BN' ? 'প্রিন্ট (A4)' : 'Print (A4)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 8px rgba(16, 185, 129, 0.35)',
              }}
            >
              {isExportingPdf ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              <span>{lang === 'BN' ? 'PDF ডাউনলোড' : 'PDF Download'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJpg}
              disabled={isExportingJpg}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 8px rgba(245, 158, 11, 0.35)',
              }}
            >
              {isExportingJpg ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
              <span>{lang === 'BN' ? 'JPG ছবি' : 'JPG Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: copied ? '#059669' : '#334155',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>{copied ? (lang === 'BN' ? 'কপি হয়েছে' : 'Copied') : (lang === 'BN' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Download toast notification */}
        {downloadToast && (
          <div
            style={{
              maxWidth: '960px',
              margin: '8px auto 0 auto',
              padding: '8px 14px',
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '8px',
              color: '#065F46',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check size={16} color="#059669" />
            <span>{downloadToast}</span>
          </div>
        )}
      </div>

      {/* Main Document Viewer Container */}
      <div
        className="certificate-viewer-wrapper"
        style={{
          maxWidth: '860px',
          margin: '24px auto',
          padding: '0 12px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* =========================================================
            THE OFFICIAL PRINTABLE A4 CERTIFICATE SHEET
            ========================================================= */}
        <div
          id="survey-printable-receipt"
          ref={printableRef}
          className="survey-certificate-a4-sheet"
          style={{
            width: '100%',
            maxWidth: '794px', // Standard 210mm A4 width at 96 DPI
            background: '#FFFFFF',
            color: '#111827',
            borderRadius: '16px',
            padding: '28px 32px',
            boxSizing: 'border-box',
            border: '2.5px solid #064E3B',
            outline: '1.5px dashed #10B981',
            outlineOffset: '-6px',
            fontFamily: "'Hind Siliguri', 'Outfit', sans-serif",
            position: 'relative',
            boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
          }}
        >
          {/* Top Official Certificate Header */}
          <div
            className="cert-header"
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #064E3B',
              paddingBottom: '14px',
              marginBottom: '16px',
              position: 'relative',
            }}
          >
            {/* 100% RELIABLE BADGE (NO GRADIENT, CRISP TEXT GUARANTEED FOR HTML/PDF/JPG) */}
            <div
              className="cert-official-badge"
              style={{
                display: 'block',
                margin: '0 auto 10px auto',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  borderRadius: '30px',
                  padding: '5px 20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#064E3B',
                  letterSpacing: '0.3px',
                  lineHeight: '1.4',
                  fontFamily: "'Hind Siliguri', sans-serif",
                  boxSizing: 'border-box',
                }}
              >
                🏅 গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত ডিজিটাল সার্ভে স্ট্যান্ডার্ড
              </span>
            </div>

            <h2
              className="cert-title"
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#064E3B',
                margin: '4px 0 3px 0',
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
                fontSize: '12px',
                color: '#047857',
                fontWeight: 700,
                letterSpacing: '0.4px',
                marginBottom: '10px',
              }}
            >
              ডিজিটাল আমিন ও ল্যান্ড রেকর্ড ম্যানেজমেন্ট শাখা • DIGITAL AMIN CERTIFIED SURVEY
            </div>

            <div
              className="cert-meta-row"
              style={{
                fontSize: '11.5px',
                color: '#374151',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                background: '#F8FAFC',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              <span>
                <strong style={{ color: '#0F172A' }}>রসিদ আইডি:</strong> {receiptId}
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>ইস্যুর সময়:</strong> {currentDateStr}
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>জমির আকার:</strong> {currentShapeTitle}
              </span>
              <span>
                <strong style={{ color: '#0F172A' }}>হিসাব মানদণ্ড:</strong> ১ কাঠা = {fmt(sotangsoPerKatha, 2)} শতক (১ একর = ১০০ শতক)
              </span>
            </div>
          </div>

          {/* Input Dimensions Summary Bar */}
          {inputItems.length > 0 && (
            <div
              style={{
                background: '#F8FAFC',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
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
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{item.label}</span>
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
              padding: '18px 22px',
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
                  fontSize: '13px',
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
                  fontSize: '36px',
                  fontWeight: 900,
                  fontFamily: 'Outfit, Hind Siliguri, monospace',
                  letterSpacing: '-0.5px',
                  color: '#34D399',
                  lineHeight: 1.15,
                  marginTop: '2px',
                }}
              >
                {fmt(result.sotangso, 4)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#D1FAE5', marginTop: '3px' }}>
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
              <div style={{ fontSize: '11.5px', color: '#A7F3D0', fontWeight: 700 }}>
                {getTranslation('katha', lang)}
              </div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  fontFamily: 'Outfit, sans-serif',
                  color: '#FFFFFF',
                }}
              >
                {fmt(result.katha, 3)}
              </div>
              <div style={{ fontSize: '10.5px', color: '#D1FAE5' }}>
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
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>
                🌾 {getTranslation('bigha', lang)}
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                {fmt(result.bigha, 4)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                {lang === 'BN' ? '২০ কাঠা / ৩৩.০৬ শতক' : '20 Katha / 33.06 Dec.'}
              </div>
            </div>

            {/* Acre */}
            <div
              className="cert-unit-box"
              style={{
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>
                🏞️ {getTranslation('acre', lang)}
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                {fmt(result.acre, 4)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                {lang === 'BN' ? '১০০ শতক / ৩.০২৫ বিঘা' : '100 Decimals / 3.025 Bigha'}
              </div>
            </div>

            {/* Total Sq. Feet */}
            <div
              className="cert-unit-box"
              style={{
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>
                📏 {getTranslation('sq_feet', lang)}
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>
                {fmtInt(result.sqFeet)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                {lang === 'BN' ? 'মোট বর্গফুট' : 'Square Feet'}
              </div>
            </div>

            {/* Total Sq. Meters */}
            <div
              className="cert-unit-box"
              style={{
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569' }}>
                🌐 {getTranslation('sq_meters', lang)}
              </div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>
                {fmtInt(result.sqMeters)}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
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
              background: '#F8FAFC',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '11.5px',
              marginBottom: '14px',
            }}
          >
            <div style={{ flex: 1, minWidth: '130px' }}>
              <span style={{ color: '#475569' }}>📐 {getTranslation('chhatak', lang)}: </span>
              <strong style={{ color: '#0F172A' }}>{fmt(result.chhatak, 2)}</strong>
              <span style={{ fontSize: '10.5px', color: '#64748B' }}> (১৬ ছটাক = ১ কাঠা)</span>
            </div>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <span style={{ color: '#475569' }}>🗺️ {getTranslation('hectare', lang)}: </span>
              <strong style={{ color: '#0F172A' }}>{fmt(result.hectare, 4)}</strong>
              <span style={{ fontSize: '10.5px', color: '#64748B' }}> (২.৪৭ একর)</span>
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
                    fontSize: '26px',
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
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ height: '36px', borderBottom: '1.5px dashed #94A3B8', margin: '0 12px 6px 12px' }} />
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>ডিজিটাল আমিন জরিপকারী</div>
              <div style={{ fontSize: '9.5px', color: '#64748B' }}>স্বাক্ষর ও আইডি সিল</div>
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
                  background: '#F0FDF4',
                  boxShadow: '0 2px 8px rgba(6, 78, 59, 0.15)',
                  margin: '0 auto 4px auto',
                }}
              >
                <ShieldCheck size={26} color="#064E3B" />
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#064E3B' }}>যাচাইকৃত প্রত্যয়নপত্র</div>
              <div style={{ fontSize: '9px', color: '#64748B' }}>ISO & BSTI স্ট্যান্ডার্ড</div>
            </div>

            <div>
              <div style={{ height: '36px', borderBottom: '1.5px dashed #94A3B8', margin: '0 12px 6px 12px' }} />
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>ভূমি মালিক / আবেদনকারী</div>
              <div style={{ fontSize: '9.5px', color: '#64748B' }}>গ্রহণকারীর স্বাক্ষর</div>
            </div>
          </div>

          {/* Official Document Footer */}
          <div
            className="cert-footer"
            style={{
              marginTop: '16px',
              paddingTop: '10px',
              borderTop: '1px dashed #CBD5E1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              color: '#64748B',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <div>ডিজিটাল আমিন অটোমেটেড সার্ভে সিস্টেম • www.rubayetkhan.is-best.net</div>
            <div>পরিমাপ পদ্ধতি: Total Station Algorithmic Computation</div>
          </div>
        </div>
      </div>
    </div>
  );
};
