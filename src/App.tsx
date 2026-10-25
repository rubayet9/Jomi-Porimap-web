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
import { TriangulationTab } from './components/triangulation/TriangulationTab';
import { KhatianTab } from './components/khatian/KhatianTab';
import { LandAiChat } from './components/ai/LandAiChat';
import { HistoryTab } from './components/history/HistoryTab';

// Modals
import { AboutDeveloperModal } from './components/modals/AboutDeveloperModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { UserManualModal } from './components/modals/UserManualModal';
import { CalculationResultModal } from './components/modals/CalculationResultModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { auth, onAuthStateChanged, FirebaseUser } from './lib/firebase';

import confetti from 'canvas-confetti';
import { Calculator, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

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
        unit: currentUnit,
        inputsDesc: inputsSummary || `${shape} calculation`,
        sqFeet: computedMetrics.sqFeet,
        sqMeters: computedMetrics.sqMeters,
        sotangso: computedMetrics.sotangso,
        katha: computedMetrics.katha,
        bigha: computedMetrics.bigha,
        totalPrice: calculatedTotalPrice,
      };

      setHistoryList((prev) => [historyItem, ...prev]);
    }
  };

  const handleManualCalculate = () => {
    calculateArea(selectedShape, inputs, unit, triangleMethod, freeformPoints, true);
    setIsResultModalOpen(true);
  };

  const handleResetCalculator = () => {
    sound.playReset();
    setInputs({});
    setFreeformPoints([]);
    setIsFreeformClosed(false);
    setResult(computeLandMetrics(0, sotangsoPerKatha));
  };

  const handleShapeSelect = (shape: LandShape) => {
    setSelectedShape(shape);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          {/* Blueprint Canvas & Dynamic Inputs Grid */}
          <div
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

                <div style={{ marginTop: '24px' }}>
                  <SkeuoButton
                    id="calculate-btn"
                    label={getTranslation('calculate_btn', lang)}
                    icon={<Calculator size={18} />}
                    colorScheme="green"
                    onClick={handleManualCalculate}
                    className="w-full"
                  />
                </div>
              </SkeuoCard>
            )}
          </div>

          {/* Formula & Theory Card */}
          <SkeuoCard style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <BookOpen size={18} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E20', marginBottom: '2px' }}>
                  {getTranslation('formula', lang)}:
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-main)', fontFamily: 'Outfit, Hind Siliguri, sans-serif' }}>
                  {getFormulaText()}
                </p>
              </div>
            </div>
          </SkeuoCard>
        </div>
      )}

      {/* Triangulation Tab */}
      {activeTab === 'TRIANGULATION' && (
        <TriangulationTab
          triangles={triangulationTriangles}
          onTrianglesChange={setTriangulationTriangles}
          unit={unit}
          onUnitChange={handleUnitChange}
          lang={lang}
          sotangsoPerKatha={sotangsoPerKatha}
          onShowResultModal={(res) => {
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
              unit: unit,
              inputsDesc: desc,
              sqFeet: res.sqFeet,
              sqMeters: res.sqMeters,
              sotangso: res.sotangso,
              katha: res.katha,
              bigha: res.bigha,
              totalPrice: computeTotalPrice(res, landPrice, priceUnit),
            };
            setHistoryList((prev) => [historyItem, ...prev]);
          }}
        />
      )}

      {/* Khatian Tab */}
      {activeTab === 'KHATIAN' && (
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
              unit: unit,
              inputsDesc: desc,
              sqFeet: sotangsoVal * 435.6,
              sqMeters: (sotangsoVal * 435.6) / 10.7639,
              sotangso: sotangsoVal,
              katha: sotangsoVal / sotangsoPerKatha,
              bigha: (sotangsoVal * 435.6) / 14400.0,
              totalPrice: computeTotalPrice(computedRes, landPrice, priceUnit),
            };
            setHistoryList((prev) => [historyItem, ...prev]);
          }}
        />
      )}

      {/* AI Assistant Tab */}
      {activeTab === 'AI_ASSISTANT' && (
        <LandAiChat lang={lang} apiKey={geminiApiKey} />
      )}

      {/* History & Price Tab */}
      {activeTab === 'HISTORY' && (
        <HistoryTab
          historyList={historyList}
          onClearHistory={() => setHistoryList([])}
          onDeleteHistoryItem={(id) => setHistoryList((prev) => prev.filter((item) => item.id !== id))}
          landPrice={landPrice}
          onLandPriceChange={setLandPrice}
          priceUnit={priceUnit}
          onPriceUnitChange={setPriceUnit}
          sotangsoPerKatha={sotangsoPerKatha}
          lang={lang}
        />
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
      />

      <CalculationResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        result={result}
        shape={selectedShape}
        inputs={inputs}
        unit={unit}
        triangleMethod={triangleMethod}
        freeformPoints={freeformPoints}
        landPrice={landPrice}
        priceUnit={priceUnit}
        sotangsoPerKatha={sotangsoPerKatha}
        lang={lang}
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
        onLogout={() => {
          setCurrentUser(null);
        }}
      />
    </div>
  );
};

export default App;
