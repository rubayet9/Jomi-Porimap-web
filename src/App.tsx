import React, { useState, useEffect } from 'react';
import {
  AppLanguage,
  AppUnit,
  AppTab,
  LandShape,
  TriangleMethod,
  PriceUnit,
  CalculationResult,
  CalculationHistoryItem,
  CanvasPoint,
} from './types';
import {
  computeLandMetrics,
  convertInputValue,
  heronFormula,
  shoelaceFormula,
  formatBDT,
  computeTotalPrice,
} from './lib/calculations';
import { DEFAULT_GEMINI_API_KEY } from './lib/gemini';
import { getTranslation } from './lib/translations';
import { sound } from './lib/sound';

// Components
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { SkeuoCard } from './components/skeuomorphic/SkeuoCard';
import { SkeuoButton } from './components/skeuomorphic/SkeuoButton';
import { SkeuoMeterDisplay } from './components/skeuomorphic/SkeuoMeterDisplay';
import { SkeuoUnitRocker } from './components/skeuomorphic/SkeuoUnitRocker';
import { ShapeSelector } from './components/calculator/ShapeSelector';
import { ShapeBlueprint } from './components/calculator/ShapeBlueprint';
import { DimensionInputs } from './components/calculator/DimensionInputs';
import { FreeformCanvas } from './components/calculator/FreeformCanvas';
import { LandValuationCard } from './components/calculator/LandValuationCard';
import { TriangulationTab } from './components/triangulation/TriangulationTab';
import { KhatianTab } from './components/khatian/KhatianTab';
import { LandAiChat } from './components/ai/LandAiChat';
import { HistoryTab } from './components/history/HistoryTab';

// Modals
import { AboutDeveloperModal } from './components/modals/AboutDeveloperModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { UserManualModal } from './components/modals/UserManualModal';
import { CalculationResultModal } from './components/modals/CalculationResultModal';
import { SurveyCertificatePage, SurveyCertificateData } from './components/certificate/SurveyCertificatePage';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { auth, onAuthStateChanged, FirebaseUser } from './lib/firebase';
import { GlobalErrorPopup } from './components/common/GlobalErrorPopup';

import confetti from 'canvas-confetti';
import { Calculator, Sparkles, BookOpen, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';

export const App: React.FC = () => {
  // Global Preferences
  const [lang, setLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem('jomi_lang') as AppLanguage) || 'BN';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('jomi_theme') === 'dark';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('jomi_sound') !== 'false';
  });

  const [sotangsoPerKatha, setSotangsoPerKatha] = useState<number>(() => {
    const val = localStorage.getItem('jomi_katha_ratio');
    return val ? parseFloat(val) : 1.65289;
  });

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    const saved = localStorage.getItem('jomi_gemini_key');
    return saved && saved.trim() !== '' ? saved : DEFAULT_GEMINI_API_KEY;
  });

  const [landPrice, setLandPrice] = useState<number>(() => {
    const val = localStorage.getItem('jomi_land_price');
    return val ? parseFloat(val) : 50000;
  });

  const [priceUnit, setPriceUnit] = useState<PriceUnit>(() => {
    return (localStorage.getItem('jomi_price_unit') as PriceUnit) || 'SOTANGSO';
  });

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<AppTab>('CALCULATOR');

  // Calculator State
  const [selectedShape, setSelectedShape] = useState<LandShape>('RECTANGLE');
  const [unit, setUnit] = useState<AppUnit>('FEET');
  const [inputs, setInputs] = useState<Record<string, string>>({
    length_1: '100',
    length_2: '100',
    width_1: '50',
    width_2: '50',
  });
  const [triangleMethod, setTriangleMethod] = useState<TriangleMethod>('BASE_HEIGHT');
  const [freeformPoints, setFreeformPoints] = useState<CanvasPoint[]>([]);
  const [isFreeformClosed, setIsFreeformClosed] = useState<boolean>(false);
  const [emptyFieldKeys, setEmptyFieldKeys] = useState<string[]>([]);
  const [showValidationSignal, setShowValidationSignal] = useState<boolean>(false);

  // Calculation Result
  const [result, setResult] = useState<CalculationResult>(() =>
    computeLandMetrics(5000, 1.65289)
  );

  // Triangulation Triangles
  const [triangulationTriangles, setTriangulationTriangles] = useState([
    { id: '1', sideA: '60', sideB: '80', sideC: '100' },
    { id: '2', sideA: '50', sideB: '70', sideC: '90' },
    { id: '3', sideA: '40', sideB: '50', sideC: '60' },
  ]);

  // History List
  const [historyList, setHistoryList] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jomi_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Dedicated Full-Page A4 Certificate View
  const [isCertificatePageOpen, setIsCertificatePageOpen] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<SurveyCertificateData | null>(null);

  // Active History item & Auto-Action for Certificate Modal
  const [activeHistoryItem, setActiveHistoryItem] = useState<CalculationHistoryItem | null>(null);
  const [modalAutoAction, setModalAutoAction] = useState<'PRINT' | 'PDF' | 'JPG' | null>(null);

  // User Auth State (Firebase real user only, demo login removed)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => auth.currentUser);

  // Listen to Firebase Auth state and load user's profile history
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userKey = `jomi_history_${user.uid}`;
        const userSaved = localStorage.getItem(userKey);
        if (userSaved) {
          try {
            setHistoryList(JSON.parse(userSaved));
          } catch {
            setHistoryList([]);
          }
        } else {
          // If first login, migrate existing device history to profile
          const generalSaved = localStorage.getItem('jomi_history');
          if (generalSaved) {
            try {
              const parsed = JSON.parse(generalSaved);
              setHistoryList(parsed);
              localStorage.setItem(userKey, generalSaved);
            } catch {}
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync theme with HTML root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('jomi_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('jomi_lang', lang);
  }, [lang]);

  useEffect(() => {
    sound.enabled = soundEnabled;
    localStorage.setItem('jomi_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('jomi_katha_ratio', String(sotangsoPerKatha));
  }, [sotangsoPerKatha]);

  useEffect(() => {
    localStorage.setItem('jomi_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  useEffect(() => {
    localStorage.setItem('jomi_land_price', String(landPrice));
  }, [landPrice]);

  useEffect(() => {
    localStorage.setItem('jomi_price_unit', priceUnit);
  }, [priceUnit]);

  useEffect(() => {
    if (currentUser?.uid) {
      localStorage.setItem(`jomi_history_${currentUser.uid}`, JSON.stringify(historyList));
    }
    localStorage.setItem('jomi_history', JSON.stringify(historyList));
  }, [historyList, currentUser]);

  // Smart Unit Switching (Converts existing values seamlessly!)
  const handleUnitChange = (newUnit: AppUnit) => {
    if (newUnit === unit) return;

    // Convert inputs
    const updatedInputs: Record<string, string> = {};
    Object.keys(inputs).forEach((key) => {
      updatedInputs[key] = convertInputValue(inputs[key], unit, newUnit);
    });
    setInputs(updatedInputs);
    setUnit(newUnit);

    // Recompute area for the new unit
    calculateArea(selectedShape, updatedInputs, newUnit, triangleMethod, freeformPoints);
  };

  const handleInputChange = (key: string, value: string) => {
    const updated = { ...inputs, [key]: value };
    setInputs(updated);
    if (parseFloat(value) > 0) {
      setEmptyFieldKeys((prev) => {
        const next = prev.filter((k) => k !== key);
        if (next.length === 0) setShowValidationSignal(false);
        return next;
      });
    }
  };

  const getVal = (key: string, currentInputs: Record<string, string> = inputs): number => {
    return parseFloat(currentInputs[key]) || 0.0;
  };

  // Main Mathematical Calculation Engine
  const calculateArea = (
    shape: LandShape = selectedShape,
    currentInputs: Record<string, string> = inputs,
    currentUnit: AppUnit = unit,
    currentTriMethod: TriangleMethod = triangleMethod,
    currentPoints: CanvasPoint[] = freeformPoints,
    shouldSaveHistory: boolean = false
  ) => {
    let calculatedArea = 0.0;
    let volume: number | undefined;
    let surfaceArea: number | undefined;

    switch (shape) {
      case 'RECTANGLE': {
        const l1 = getVal('length_1', currentInputs) || getVal('length', currentInputs);
        const l2 = getVal('length_2', currentInputs) || l1;
        const w1 = getVal('width_1', currentInputs) || getVal('width', currentInputs);
        const w2 = getVal('width_2', currentInputs) || w1;
        calculatedArea = ((l1 + l2) / 2.0) * ((w1 + w2) / 2.0);
        break;
      }

      case 'SQUARE': {
        const baseSide = getVal('side', currentInputs);
        const s1 = getVal('side_1', currentInputs) || baseSide;
        const s2 = getVal('side_2', currentInputs) || s1;
        const s3 = getVal('side_3', currentInputs) || s1;
        const s4 = getVal('side_4', currentInputs) || s1;
        calculatedArea = ((s1 + s2) / 2.0) * ((s3 + s4) / 2.0);
        break;
      }

      case 'TRIANGLE': {
        if (currentTriMethod === 'BASE_HEIGHT') {
          const b = getVal('base', currentInputs);
          const h = getVal('height', currentInputs);
          calculatedArea = 0.5 * b * h;
        } else {
          const a = getVal('side_a', currentInputs);
          const b = getVal('side_b', currentInputs);
          const c = getVal('side_c', currentInputs);
          calculatedArea = heronFormula(a, b, c);
        }
        break;
      }

      case 'RHOMBUS': {
        const d1 = getVal('diag_1', currentInputs);
        const d2 = getVal('diag_2', currentInputs);
        calculatedArea = 0.5 * d1 * d2;
        break;
      }

      case 'PARALLELOGRAM': {
        const b = getVal('base', currentInputs);
        const h = getVal('height', currentInputs);
        calculatedArea = b * h;
        break;
      }

      case 'TRAPEZIUM': {
        const a = getVal('side_a', currentInputs);
        const b = getVal('side_b', currentInputs);
        const h = getVal('height', currentInputs);
        calculatedArea = 0.5 * (a + b) * h;
        break;
      }

      case 'PENTAGON': {
        const s1 = getVal('side_1', currentInputs) || getVal('side', currentInputs);
        const s2 = getVal('side_2', currentInputs) || s1;
        const s3 = getVal('side_3', currentInputs) || s1;
        const s4 = getVal('side_4', currentInputs) || s1;
        const s5 = getVal('side_5', currentInputs) || s1;
        const d1 = getVal('diag_1_pent', currentInputs);
        const d2 = getVal('diag_2_pent', currentInputs);

        if (d1 > 0 && d2 > 0) {
          const a1 = heronFormula(s1, s2, d1);
          const a2 = heronFormula(d1, s3, d2);
          const a3 = heronFormula(d2, s4, s5);
          calculatedArea = a1 + a2 + a3;
        } else {
          const avgS = (s1 + s2 + s3 + s4 + s5) / 5.0;
          calculatedArea = 0.25 * Math.sqrt(5.0 * (5.0 + 2.0 * Math.sqrt(5.0))) * avgS * avgS;
        }
        break;
      }

      case 'HEXAGON': {
        const baseSide = getVal('side', currentInputs);
        const s1 = getVal('side_1', currentInputs) || baseSide;
        const s2 = getVal('side_2', currentInputs) || s1;
        const s3 = getVal('side_3', currentInputs) || s1;
        const s4 = getVal('side_4', currentInputs) || s1;
        const s5 = getVal('side_5', currentInputs) || s1;
        const s6 = getVal('side_6', currentInputs) || s1;
        const avgS = (s1 + s2 + s3 + s4 + s5 + s6) / 6.0;
        calculatedArea = 1.5 * Math.sqrt(3.0) * avgS * avgS;
        break;
      }

      case 'CUBE': {
        const s = getVal('side', currentInputs);
        const d = getVal('depth', currentInputs) || s;
        calculatedArea = s * s;
        volume = s * s * d;
        surfaceArea = 6.0 * s * s;
        break;
      }

      case 'QUADRILATERAL': {
        const a = getVal('side_a', currentInputs);
        const b = getVal('side_b', currentInputs);
        const c = getVal('side_c', currentInputs);
        const d = getVal('side_d', currentInputs);
        const e = getVal('diag_e', currentInputs);

        const a1 = heronFormula(a, b, e);
        const a2 = heronFormula(c, d, e);
        calculatedArea = a1 + a2;
        break;
      }

      case 'FREEFORM': {
        calculatedArea = shoelaceFormula(currentPoints, 10);
        break;
      }
    }

    // Convert into Sq.Feet and standard metrics
    const sqFeet = currentUnit === 'FEET' ? calculatedArea : calculatedArea * 10.76391041671097;
    const computedMetrics = computeLandMetrics(sqFeet, sotangsoPerKatha, volume, surfaceArea);

    setResult(computedMetrics);

    if (shouldSaveHistory && calculatedArea > 0) {
      sound.playBeep();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4EFA8A', '#FFD166', '#2E7D32', '#1E88E5'],
        });
      } catch {
        // fallback
      }

      const inputsSummary = Object.entries(currentInputs)
        .filter(([_, v]) => v && v !== '0')
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');

      const calculatedTotalPrice = computeTotalPrice(computedMetrics, landPrice, priceUnit);

      const historyItem: CalculationHistoryItem = {
        id: String(Date.now()),
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        tabType: 'CALCULATOR',
        shapeType: shape,
        shape: shape,
        unit: currentUnit,
        inputsDesc: inputsSummary || `${shape} calculation`,
        inputs: { ...currentInputs },
        result: computedMetrics,
        triangleMethod: currentTriMethod,
        sqFeet: computedMetrics.sqFeet,
        sqMeters: computedMetrics.sqMeters,
        sotangso: computedMetrics.sotangso,
        katha: computedMetrics.katha,
        bigha: computedMetrics.bigha,
        landPrice: landPrice,
        priceUnit: priceUnit,
        totalPrice: calculatedTotalPrice,
      };

      setHistoryList((prev) => [historyItem, ...prev]);
    }
  };

  const getRequiredFields = (
    shape: LandShape,
    triMethod: TriangleMethod,
    currentInputs: Record<string, string>
  ): string[] => {
    switch (shape) {
      case 'RECTANGLE':
        return ['length_1', 'length_2', 'width_1', 'width_2'];
      case 'SQUARE':
        if (parseFloat(currentInputs['side']) > 0) return ['side'];
        if (
          currentInputs['side_1'] ||
          currentInputs['side_2'] ||
          currentInputs['side_3'] ||
          currentInputs['side_4']
        ) {
          return ['side_1', 'side_2', 'side_3', 'side_4'];
        }
        return ['side'];
      case 'TRIANGLE':
        return triMethod === 'BASE_HEIGHT' ? ['base', 'height'] : ['side_a', 'side_b', 'side_c'];
      case 'RHOMBUS':
        return ['diag_1', 'diag_2'];
      case 'PARALLELOGRAM':
        return ['base', 'height'];
      case 'TRAPEZIUM':
        return ['side_a', 'side_b', 'height'];
      case 'QUADRILATERAL':
        return ['side_a', 'side_b', 'side_c', 'side_d', 'diag_e'];
      case 'PENTAGON':
        return ['side_1', 'side_2', 'side_3', 'side_4', 'side_5'];
      case 'HEXAGON':
        if (parseFloat(currentInputs['side']) > 0) return ['side'];
        if (
          currentInputs['side_1'] ||
          currentInputs['side_2'] ||
          currentInputs['side_3'] ||
          currentInputs['side_4'] ||
          currentInputs['side_5'] ||
          currentInputs['side_6']
        ) {
          return ['side_1', 'side_2', 'side_3', 'side_4', 'side_5', 'side_6'];
        }
        return ['side'];
      case 'CUBE':
        return ['side', 'depth'];
      default:
        return [];
    }
  };

  const handleOpenCertificatePage = (
    action?: 'PRINT' | 'PDF' | 'JPG',
    customItem?: CalculationHistoryItem | null
  ) => {
    sound.playClick();
    const item = customItem || activeHistoryItem;

    const targetResult = item
      ? item.result || computeLandMetrics(item.sqFeet, sotangsoPerKatha)
      : result;

    const targetShape = item
      ? (item.shape ||
          (item.tabType === 'KHATIAN'
            ? 'KHATIAN'
            : item.tabType === 'TRIANGULATION'
            ? 'TRIANGULATION'
            : (item.shapeType as LandShape)) ||
          'RECTANGLE')
      : selectedShape;

    const targetInputs = item
      ? item.inputs || { description: item.inputsDesc }
      : inputs;

    const targetUnit = item ? item.unit || unit : unit;
    const targetTriMethod = item ? item.triangleMethod || triangleMethod : triangleMethod;
    const targetPrice = item?.landPrice !== undefined ? item.landPrice : landPrice;
    const targetPriceUnit = item?.priceUnit || priceUnit;
    const targetReceiptId = item ? `JP-HIST-${item.id.slice(-6)}` : undefined;
    const targetDateStr = item?.dateStr;

    setCertificateData({
      result: targetResult,
      shape: targetShape,
      inputs: targetInputs,
      unit: targetUnit,
      triangleMethod: targetTriMethod,
      landPrice: targetPrice,
      priceUnit: targetPriceUnit,
      sotangsoPerKatha: sotangsoPerKatha,
      receiptId: targetReceiptId,
      dateStr: targetDateStr,
      autoAction: action || null,
    });

    setIsResultModalOpen(false);
    setIsProfileModalOpen(false);
    setIsCertificatePageOpen(true);
  };

  const handleViewHistoryReceipt = (item: CalculationHistoryItem, action?: 'PRINT' | 'PDF' | 'JPG') => {
    handleOpenCertificatePage(action, item);
  };

  const handleManualCalculate = () => {
    setActiveHistoryItem(null);
    setModalAutoAction(null);
    if (selectedShape === 'FREEFORM') {
      if (freeformPoints.length < 3) {
        sound.playReset();
        return;
      }
      calculateArea(selectedShape, inputs, unit, triangleMethod, freeformPoints, true);
      setIsResultModalOpen(true);
      return;
    }

    const requiredKeys = getRequiredFields(selectedShape, triangleMethod, inputs);
    const missingKeys = requiredKeys.filter((key) => {
      const val = parseFloat(inputs[key]);
      return isNaN(val) || val <= 0;
    });

    if (missingKeys.length > 0) {
      sound.playReset();
      setEmptyFieldKeys(missingKeys);
      setShowValidationSignal(true);

      const firstInput = document.getElementById(`input-${missingKeys[0]}`);
      if (firstInput) {
        firstInput.focus();
        firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setEmptyFieldKeys([]);
    setShowValidationSignal(false);
    calculateArea(selectedShape, inputs, unit, triangleMethod, freeformPoints, true);
    setIsResultModalOpen(true);
  };

  const handleResetCalculator = () => {
    sound.playReset();
    setInputs({});
    setEmptyFieldKeys([]);
    setShowValidationSignal(false);
    setFreeformPoints([]);
    setIsFreeformClosed(false);
    setResult(computeLandMetrics(0, sotangsoPerKatha));
  };

  const handleShapeSelect = (shape: LandShape) => {
    setSelectedShape(shape);
    setEmptyFieldKeys([]);
    setShowValidationSignal(false);
    // Provide sensible default inputs based on shape
    let defaultInputs: Record<string, string> = {};
    if (shape === 'RECTANGLE') {
      defaultInputs = { length_1: '100', length_2: '100', width_1: '50', width_2: '50' };
    } else if (shape === 'TRIANGLE') {
      defaultInputs = { base: '80', height: '60', side_a: '60', side_b: '80', side_c: '100' };
    } else if (shape === 'QUADRILATERAL') {
      defaultInputs = { side_a: '70', side_b: '80', side_c: '90', side_d: '75', diag_e: '110' };
    } else if (shape === 'PENTAGON') {
      defaultInputs = { side: '50', diag_1_pent: '80', diag_2_pent: '80' };
    } else if (shape === 'HEXAGON') {
      defaultInputs = { side: '40' };
    }
    setInputs(defaultInputs);
    calculateArea(shape, defaultInputs, unit, triangleMethod, []);
  };

  // Formula description
  const getFormulaText = () => {
    switch (selectedShape) {
      case 'RECTANGLE':
        return getTranslation('f_rect', lang);
      case 'SQUARE':
        return getTranslation('f_sq', lang);
      case 'TRIANGLE':
        return triangleMethod === 'BASE_HEIGHT'
          ? getTranslation('f_tri_bh', lang)
          : getTranslation('f_tri_heron', lang);
      case 'RHOMBUS':
        return getTranslation('f_rhom', lang);
      case 'PARALLELOGRAM':
        return getTranslation('f_para', lang);
      case 'TRAPEZIUM':
        return getTranslation('f_trap', lang);
      case 'PENTAGON':
        return getTranslation('f_pent', lang);
      case 'HEXAGON':
        return getTranslation('f_hex', lang);
      case 'CUBE':
        return getTranslation('f_cube', lang);
      case 'QUADRILATERAL':
        return getTranslation('f_quad', lang);
      case 'FREEFORM':
        return getTranslation('f_freeform', lang);
      default:
        return '';
    }
  };

  if (isCertificatePageOpen && certificateData) {
    return (
      <SurveyCertificatePage
        data={certificateData}
        lang={lang}
        onBack={() => {
          sound.playClick();
          setIsCertificatePageOpen(false);
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* 1. Header */}
      <Header
        lang={lang}
        onLangChange={setLang}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDeveloper={() => setIsDeveloperOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 2. Top Navigation Tabs */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} lang={lang} />

      {/* 3. Tab Contents */}
      {activeTab === 'CALCULATOR' && (
        <div key="CALCULATOR" className="tab-content-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Shape Selector Bar */}
          <SkeuoCard style={{ padding: '16px' }}>
            <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>
              {lang === 'BN' ? '১. জমির আকার নির্বাচন করুন:' : '1. Select Land Shape / Method:'}
            </div>
            <ShapeSelector
              selectedShape={selectedShape}
              onSelectShape={handleShapeSelect}
              lang={lang}
            />
          </SkeuoCard>

          {/* Digital Total Station LCD Display */}
          <SkeuoMeterDisplay
            result={result}
            unit={unit}
            lang={lang}
            onReset={handleResetCalculator}
            isCube={selectedShape === 'CUBE'}
            titleBadge={selectedShape}
          />

          {/* Mechanical Unit Rocker Switch (Feet ⇄ Meters) */}
          <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
            <SkeuoUnitRocker unit={unit} onUnitChange={handleUnitChange} lang={lang} />
          </div>

          {/* SECTION 1: MEASUREMENT & BLUEPRINT CANVAS */}
          <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>📐</span>
                <span>{lang === 'BN' ? 'ধাপ ১' : 'STEP 1'}</span>
              </div>
              <h2 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {lang === 'BN' ? 'জমির পরিমাপ ও ড্রাফটিং নকশা' : 'Land Measurement & Blueprint Canvas'}
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {lang === 'BN' ? 'সঠিক মাপ ইনপুট দিয়ে ক্ষেত্রফল নির্ণয় করুন' : 'Enter dimensions to calculate land area'}
            </span>
          </div>

          {/* Blueprint Canvas & Dynamic Inputs Grid with Smooth Shape Transition */}
          <div
            key={`${selectedShape}-${unit}`}
            className="shape-content-enter"
            style={{
              display: 'grid',
              gridTemplateColumns: selectedShape === 'FREEFORM' ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Visual Canvas Card */}
            <SkeuoCard showScrews style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📐</span>
                <span>
                  {selectedShape === 'FREEFORM'
                    ? getTranslation('shape_freeform', lang)
                    : lang === 'BN'
                    ? 'নকশা ও ড্রাফটিং ক্যানভাস'
                    : 'Drafting Canvas Blueprint'}
                </span>
              </div>

              {selectedShape === 'FREEFORM' ? (
                <div>
                  <FreeformCanvas
                    points={freeformPoints}
                    isClosed={isFreeformClosed}
                    onPointsChange={(pts, closed) => {
                      setFreeformPoints(pts);
                      setIsFreeformClosed(closed);
                      calculateArea(selectedShape, inputs, unit, triangleMethod, pts);
                    }}
                    unit={unit}
                    lang={lang}
                  />
                  {freeformPoints.length >= 3 && (
                    <div style={{ marginTop: '14px' }}>
                      <SkeuoButton
                        label={getTranslation('calculate_btn', lang)}
                        icon={<Calculator size={18} />}
                        colorScheme="green"
                        onClick={handleManualCalculate}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <ShapeBlueprint
                  shape={selectedShape}
                  inputs={inputs}
                  triangleMethod={triangleMethod}
                  unitLabel={unit === 'FEET' ? 'ft' : 'm'}
                  lang={lang}
                />
              )}
            </SkeuoCard>

            {/* Inputs & Actions Card */}
            {selectedShape !== 'FREEFORM' && (
              <SkeuoCard showScrews style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✏️</span>
                    <span>{getTranslation('input_fields', lang)}</span>
                  </div>

                  <DimensionInputs
                    shape={selectedShape}
                    inputs={inputs}
                    emptyFields={emptyFieldKeys}
                    onInputChange={handleInputChange}
                    triangleMethod={triangleMethod}
                    onTriangleMethodChange={(m) => {
                      setTriangleMethod(m);
                      calculateArea(selectedShape, inputs, unit, m, freeformPoints);
                    }}
                    unit={unit}
                    lang={lang}
                  />
                </div>

                {/* Empty field reminder / signal alert banner */}
                {showValidationSignal && (
                  <div
                    className="input-field-shake"
                    style={{
                      marginTop: '16px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1.5px solid #EF4444',
                      color: '#DC2626',
                      fontSize: '13px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                    <span>
                      {lang === 'BN'
                        ? '⚠️ অনুগ্রহ করে লাল চিহ্নিত ফাঁকা ঘরগুলোতে সঠিক পরিমাপ লিখুন!'
                        : '⚠️ Please enter valid measurements in the highlighted fields!'}
                    </span>
                  </div>
                )}

                <div className="calc-action-row" style={{ marginTop: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1.25 }}>
                    <SkeuoButton
                      id="calculate-btn"
                      label={getTranslation('calculate_btn', lang)}
                      icon={<Calculator size={18} />}
                      colorScheme="green"
                      onClick={handleManualCalculate}
                      className="w-full"
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <button
                      type="button"
                      id="reset-measurements-btn"
                      onClick={handleResetCalculator}
                      className="rocker-btn calc-reset-btn"
                      title={lang === 'BN' ? 'সব পরিমাপ মুছে ফেলুন ও নতুন পরিমাপ দিন' : 'Clear and reset inputs'}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 14px',
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        border: '1.5px solid rgba(239, 68, 68, 0.5)',
                        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.2) 100%)',
                        color: '#EF4444',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Trash2 size={16} />
                      <span>{lang === 'BN' ? 'মুছে ফেলুন' : 'Clear All'}</span>
                    </button>
                  </div>
                </div>
              </SkeuoCard>
            )}
          </div>

          {/* SECTION 2 SEPARATOR & BANNER */}
          <div style={{ margin: '36px 0 16px 0', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '6px',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>💰</span>
                <span>{lang === 'BN' ? 'ধাপ ২' : 'STEP 2'}</span>
              </div>
              <h2 style={{ fontSize: '15.5px', fontWeight: 800, color: '#B45309', margin: 0 }}>
                {lang === 'BN' ? 'জমির আর্থিক মূল্যায়ন ও মোট বাজার দর' : 'Land Valuation & Total Market Value'}
              </h2>
              <div
                style={{
                  flex: 1,
                  height: '1.5px',
                  background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0.05) 100%)',
                }}
              />
            </div>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              {lang === 'BN'
                ? 'পরিমাপকৃত জমির মোট শতক/কাঠা বা যেকোনো পরিমাণের ভিত্তিতে সরাসরি মোট মূল্য হিসাব করুন'
                : 'Calculate total purchase or sale price based on current measured area or custom amount'}
            </p>
          </div>

          {/* Land Valuation & Pricing Calculator (inside Calculator Tab) */}
          <LandValuationCard
            currentSotangso={result.sotangso}
            currentKatha={result.katha}
            currentBigha={result.bigha}
            landPrice={landPrice}
            onLandPriceChange={setLandPrice}
            priceUnit={priceUnit}
            onPriceUnitChange={setPriceUnit}
            sotangsoPerKatha={sotangsoPerKatha}
            lang={lang}
          />

          {/* Calculation Formula card hidden per user request */}
        </div>
      )}

      {/* Triangulation Tab */}
      {activeTab === 'TRIANGULATION' && (
        <div key="TRIANGULATION" className="tab-content-enter">
          <TriangulationTab
            triangles={triangulationTriangles}
            onTrianglesChange={setTriangulationTriangles}
            unit={unit}
            onUnitChange={handleUnitChange}
            lang={lang}
            sotangsoPerKatha={sotangsoPerKatha}
            onShowResultModal={(res) => {
              setActiveHistoryItem(null);
              setModalAutoAction(null);
              setResult(res);
              setSelectedShape('TRIANGLE');
              setIsResultModalOpen(true);
            }}
            onSaveHistory={(res, desc) => {
              const historyItem: CalculationHistoryItem = {
                id: String(Date.now()),
                timestamp: Date.now(),
                dateStr: new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                tabType: 'TRIANGULATION',
                shapeType: 'Triangulation',
                shape: 'TRIANGLE',
                unit: unit,
                inputsDesc: desc,
                inputs: { description: desc },
                result: res,
                sqFeet: res.sqFeet,
                sqMeters: res.sqMeters,
                sotangso: res.sotangso,
                katha: res.katha,
                bigha: res.bigha,
                landPrice: landPrice,
                priceUnit: priceUnit,
                totalPrice: computeTotalPrice(res, landPrice, priceUnit),
              };
              setHistoryList((prev) => [historyItem, ...prev]);
            }}
          />
        </div>
      )}

      {/* Khatian Tab */}
      {activeTab === 'KHATIAN' && (
        <div key="KHATIAN" className="tab-content-enter">
          <KhatianTab
            lang={lang}
            landPrice={landPrice}
            priceUnit={priceUnit}
            sotangsoPerKatha={sotangsoPerKatha}
            unit={unit}
            onUnitChange={handleUnitChange}
            onSaveHistory={(sotangsoVal, desc) => {
              const computedRes = computeLandMetrics(sotangsoVal * 435.6, sotangsoPerKatha);
              const historyItem: CalculationHistoryItem = {
                id: String(Date.now()),
                timestamp: Date.now(),
                dateStr: new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                tabType: 'KHATIAN',
                shapeType: 'Khatian',
                shape: 'KHATIAN',
                unit: unit,
                inputsDesc: desc,
                inputs: { description: desc },
                result: computedRes,
                sqFeet: sotangsoVal * 435.6,
                sqMeters: (sotangsoVal * 435.6) / 10.7639,
                sotangso: sotangsoVal,
                katha: sotangsoVal / sotangsoPerKatha,
                bigha: (sotangsoVal * 435.6) / 14400.0,
                landPrice: landPrice,
                priceUnit: priceUnit,
                totalPrice: computeTotalPrice(computedRes, landPrice, priceUnit),
              };
              setHistoryList((prev) => [historyItem, ...prev]);
            }}
          />
        </div>
      )}

      {/* AI Assistant Tab */}
      {activeTab === 'AI_ASSISTANT' && (
        <div key="AI_ASSISTANT" className="tab-content-enter">
          <LandAiChat lang={lang} apiKey={geminiApiKey} />
        </div>
      )}

      {/* History & Price Tab */}
      {activeTab === 'HISTORY' && (
        <div key="HISTORY" className="tab-content-enter">
          <HistoryTab
            historyList={historyList}
            onClearHistory={() => setHistoryList([])}
            onDeleteHistoryItem={(id) => setHistoryList((prev) => prev.filter((item) => item.id !== id))}
            onViewReceipt={handleViewHistoryReceipt}
            landPrice={landPrice}
            onLandPriceChange={setLandPrice}
            priceUnit={priceUnit}
            onPriceUnitChange={setPriceUnit}
            sotangsoPerKatha={sotangsoPerKatha}
            lang={lang}
          />
        </div>
      )}

      {/* Modals */}
      <AboutDeveloperModal
        isOpen={isDeveloperOpen}
        onClose={() => setIsDeveloperOpen(false)}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        onLangChange={setLang}
        isDark={isDark}
        onThemeToggle={() => setIsDark(!isDark)}
        unit={unit}
        onUnitChange={handleUnitChange}
        sotangsoPerKatha={sotangsoPerKatha}
        onSotangsoPerKathaChange={setSotangsoPerKatha}
        apiKey={geminiApiKey}
        onApiKeyChange={setGeminiApiKey}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        landPrice={landPrice}
        onLandPriceChange={setLandPrice}
        priceUnit={priceUnit}
        onPriceUnitChange={setPriceUnit}
        onOpenDeveloper={() => {
          setIsSettingsOpen(false);
          setIsDeveloperOpen(true);
        }}
        currentUser={currentUser}
      />

      <CalculationResultModal
        isOpen={isResultModalOpen}
        onClose={() => {
          setIsResultModalOpen(false);
          setActiveHistoryItem(null);
          setModalAutoAction(null);
        }}
        result={
          activeHistoryItem
            ? activeHistoryItem.result ||
              computeLandMetrics(activeHistoryItem.sqFeet, sotangsoPerKatha)
            : result
        }
        shape={
          activeHistoryItem
            ? (activeHistoryItem.shape ||
                (activeHistoryItem.tabType === 'KHATIAN'
                  ? 'KHATIAN'
                  : activeHistoryItem.tabType === 'TRIANGULATION'
                  ? 'TRIANGULATION'
                  : (activeHistoryItem.shapeType as LandShape)) ||
                'RECTANGLE')
            : selectedShape
        }
        inputs={
          activeHistoryItem
            ? activeHistoryItem.inputs || { description: activeHistoryItem.inputsDesc }
            : inputs
        }
        unit={activeHistoryItem ? activeHistoryItem.unit || unit : unit}
        triangleMethod={
          activeHistoryItem ? activeHistoryItem.triangleMethod || triangleMethod : triangleMethod
        }
        freeformPoints={activeHistoryItem ? undefined : freeformPoints}
        landPrice={activeHistoryItem?.landPrice !== undefined ? activeHistoryItem.landPrice : landPrice}
        priceUnit={activeHistoryItem?.priceUnit || priceUnit}
        sotangsoPerKatha={sotangsoPerKatha}
        lang={lang}
        onOpenCertificatePage={(action) => handleOpenCertificatePage(action)}
      />

      <UserManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        lang={lang}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        lang={lang}
        currentUser={currentUser}
        historyList={historyList}
        onDeleteHistoryItem={(id) => setHistoryList((prev) => prev.filter((item) => item.id !== id))}
        onClearHistory={() => setHistoryList([])}
        onViewReceipt={(item, action) => {
          setIsProfileModalOpen(false);
          handleViewHistoryReceipt(item, action);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
      />

      {/* Global Toast & Error Popup */}
      <GlobalErrorPopup lang={lang} />
    </div>
  );
};

export default App;
