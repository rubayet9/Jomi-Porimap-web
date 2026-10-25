import React from 'react';
import { Plus, Trash2, RotateCcw, AlertTriangle, Calculator, Sparkles } from 'lucide-react';
import { AppLanguage, AppUnit, CalculationResult, CustomTriangle } from '../../types';
import { getTranslation } from '../../lib/translations';
import { heronFormula, isValidTriangle, computeLandMetrics } from '../../lib/calculations';
import { SkeuoCard } from '../skeuomorphic/SkeuoCard';
import { SkeuoButton } from '../skeuomorphic/SkeuoButton';
import { SkeuoMeterDisplay } from '../skeuomorphic/SkeuoMeterDisplay';
import { SkeuoUnitRocker } from '../skeuomorphic/SkeuoUnitRocker';
import { sound } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface TriangulationTabProps {
  triangles: CustomTriangle[];
  onTrianglesChange: (triangles: CustomTriangle[]) => void;
  unit: AppUnit;
  onUnitChange: (unit: AppUnit) => void;
  lang: AppLanguage;
  sotangsoPerKatha: number;
  onSaveHistory: (result: CalculationResult, desc: string) => void;
  onShowResultModal?: (result: CalculationResult) => void;
}

export const TriangulationTab: React.FC<TriangulationTabProps> = ({
  triangles,
  onTrianglesChange,
  unit,
  onUnitChange,
  lang,
  sotangsoPerKatha,
  onSaveHistory,
  onShowResultModal,
}) => {
  const unitLabel = unit === 'FEET' ? 'ft' : 'm';

  // Compute total area
  const computeTotalArea = () => {
    let totalSqFt = 0;
    triangles.forEach((tri) => {
      const a = parseFloat(tri.sideA) || 0;
      const b = parseFloat(tri.sideB) || 0;
      const c = parseFloat(tri.sideC) || 0;
      if (isValidTriangle(a, b, c)) {
        const area = heronFormula(a, b, c);
        if (unit === 'FEET') {
          totalSqFt += area;
        } else {
          totalSqFt += area * 10.76391041671097;
        }
      }
    });
    return computeLandMetrics(totalSqFt, sotangsoPerKatha);
  };

  const currentResult = computeTotalArea();

  const handleSideChange = (id: string, side: 'sideA' | 'sideB' | 'sideC', val: string) => {
    const updated = triangles.map((t) => {
      if (t.id === id) {
        return { ...t, [side]: val };
      }
      return t;
    });
    onTrianglesChange(updated);
  };

  const handleAddTriangle = () => {
    sound.playClick();
    const newTri: CustomTriangle = {
      id: String(Date.now()),
      sideA: '',
      sideB: '',
      sideC: '',
    };
    onTrianglesChange([...triangles, newTri]);
  };

  const handleRemoveTriangle = (id: string) => {
    if (triangles.length <= 1) return;
    sound.playClick();
    onTrianglesChange(triangles.filter((t) => t.id !== id));
  };

  const handleReset = () => {
    sound.playReset();
    onTrianglesChange([
      { id: '1', sideA: '', sideB: '', sideC: '' },
      { id: '2', sideA: '', sideB: '', sideC: '' },
      { id: '3', sideA: '', sideB: '', sideC: '' },
    ]);
  };

  const handleCalculateAndSave = () => {
    sound.playBeep();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4EFA8A', '#FFD166', '#2E7D32'],
      });
    } catch {
      // fallback
    }

    const desc = `${triangles.length} Triangles (Heron Triangulation)`;
    onSaveHistory(currentResult, desc);
    if (onShowResultModal) {
      onShowResultModal(currentResult);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Explanation Card */}
      <SkeuoCard style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E20' }}>
              📐 {getTranslation('triangulation_title', lang)}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '650px', lineHeight: 1.6 }}>
              {getTranslation('triangulation_desc', lang)}
            </p>
          </div>

          <div style={{ minWidth: '180px' }}>
            <SkeuoUnitRocker unit={unit} onUnitChange={onUnitChange} lang={lang} />
          </div>
        </div>
      </SkeuoCard>

      {/* Real-Time Total Station Meter */}
      <SkeuoMeterDisplay
        result={currentResult}
        unit={unit}
        lang={lang}
        onReset={handleReset}
        titleBadge="TRIANGULATION SURVEY"
      />

      {/* Triangles List Container */}
      <SkeuoCard showScrews style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📊</span>
            <span>{lang === 'BN' ? 'ত্রিভুজসমূহের ৩ বাহুর মাপ ইনপুট' : 'Triangle 3-Side Inputs'}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>({triangles.length} Triangles)</span>
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleAddTriangle}
              className="skeuo-btn skeuo-btn-green"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <Plus size={14} />
              <span>{getTranslation('add_triangle_btn', lang)}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="skeuo-btn skeuo-btn-danger"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <RotateCcw size={14} />
              <span>{getTranslation('reset', lang)}</span>
            </button>
          </div>
        </div>

        {/* Triangle Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {triangles.map((tri, index) => {
            const a = parseFloat(tri.sideA) || 0;
            const b = parseFloat(tri.sideB) || 0;
            const c = parseFloat(tri.sideC) || 0;
            const hasValues = tri.sideA && tri.sideB && tri.sideC;
            const valid = isValidTriangle(a, b, c);
            const subArea = valid ? heronFormula(a, b, c) : 0;
            const subSotangso = unit === 'FEET' ? subArea / 435.6 : (subArea * 10.7639) / 435.6;

            return (
              <div
                key={tri.id}
                style={{
                  background: 'var(--surface-plate)',
                  border: valid
                    ? '1.5px solid rgba(46, 125, 50, 0.4)'
                    : hasValues
                    ? '1.5px solid #D32F2F'
                    : '1px solid var(--border-rim)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      #{index + 1}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {getTranslation('triangle_no', lang, index + 1)}
                    </span>
                  </div>

                  {triangles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTriangle(tri.id)}
                      title={getTranslation('remove_triangle_btn', lang)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#D32F2F',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      <Trash2 size={14} />
                      <span>{getTranslation('remove_triangle_btn', lang)}</span>
                    </button>
                  )}
                </div>

                {/* 3 Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      {getTranslation('dim_side_a', lang)} ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={tri.sideA}
                      onChange={(e) => handleSideChange(tri.id, 'sideA', e.target.value)}
                      className="skeuo-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      {getTranslation('dim_side_b', lang)} ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={tri.sideB}
                      onChange={(e) => handleSideChange(tri.id, 'sideB', e.target.value)}
                      className="skeuo-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', display: 'block' }}>
                      {getTranslation('dim_side_c', lang)} ({unitLabel})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={tri.sideC}
                      onChange={(e) => handleSideChange(tri.id, 'sideC', e.target.value)}
                      className="skeuo-input"
                    />
                  </div>
                </div>

                {/* Validation & Subtotal */}
                {hasValues && !valid && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D32F2F', fontSize: '11px', fontWeight: 700 }}>
                    <AlertTriangle size={13} />
                    <span>{getTranslation('invalid_triangle', lang)}</span>
                  </div>
                )}

                {valid && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(46, 125, 50, 0.08)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: '#1B5E20' }}>
                      {lang === 'BN' ? 'ক্ষেত্রফল (হেরন সূত্র):' : 'Heron Area:'}
                    </span>
                    <span style={{ color: '#2E7D32', fontWeight: 900 }}>
                      {subArea.toFixed(2)} {unit === 'FEET' ? 'Sq.Ft' : 'Sq.M'} ≈ {subSotangso.toFixed(4)} {getTranslation('sotangso', lang)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <SkeuoButton
            label={getTranslation('calculate_btn', lang)}
            icon={<Calculator size={18} />}
            colorScheme="green"
            onClick={handleCalculateAndSave}
            className="flex-1"
          />

          <button
            type="button"
            onClick={handleAddTriangle}
            className="skeuo-btn skeuo-btn-brass"
            style={{ padding: '12px 18px', fontSize: '14px' }}
          >
            <Sparkles size={16} />
            <span>{getTranslation('add_triangle_btn', lang)}</span>
          </button>
        </div>
      </SkeuoCard>
    </div>
  );
};
