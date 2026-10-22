import React from 'react';
import { AppLanguage, AppUnit, LandShape, TriangleMethod } from '../../types';
import { getTranslation } from '../../lib/translations';
import { sound } from '../../lib/sound';

interface DimensionInputsProps {
  shape: LandShape;
  inputs: Record<string, string>;
  onInputChange: (key: string, value: string) => void;
  triangleMethod: TriangleMethod;
  onTriangleMethodChange: (method: TriangleMethod) => void;
  unit: AppUnit;
  lang: AppLanguage;
}

export const DimensionInputs: React.FC<DimensionInputsProps> = ({
  shape,
  inputs,
  onInputChange,
  triangleMethod,
  onTriangleMethodChange,
  unit,
  lang,
}) => {
  const unitLabel = unit === 'FEET' ? 'ft' : 'm';

  const renderField = (key: string, labelKey: string, placeholder?: string) => {
    return (
      <div style={{ flex: '1 1 180px', minWidth: '140px' }}>
        <label className="field-label">
          {getTranslation(labelKey, lang)} ({unitLabel})
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            step="any"
            value={inputs[key] || ''}
            onChange={(e) => onInputChange(key, e.target.value)}
            placeholder={placeholder || '0.00'}
            className="skeuo-input"
          />
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            {unitLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Triangle Method Toggle */}
      {shape === 'TRIANGLE' && (
        <div
          style={{
            background: 'var(--surface-plate)',
            padding: '6px',
            borderRadius: '12px',
            display: 'flex',
            gap: '6px',
            border: '1px solid var(--border-rim)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onTriangleMethodChange('BASE_HEIGHT');
            }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '9px',
              border: 'none',
              background:
                triangleMethod === 'BASE_HEIGHT'
                  ? 'linear-gradient(180deg, #388E3C 0%, #1B5E20 100%)'
                  : 'transparent',
              color: triangleMethod === 'BASE_HEIGHT' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            📐 {getTranslation('tri_base_height', lang)}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onTriangleMethodChange('THREE_SIDES');
            }}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: '9px',
              border: 'none',
              background:
                triangleMethod === 'THREE_SIDES'
                  ? 'linear-gradient(180deg, #388E3C 0%, #1B5E20 100%)'
                  : 'transparent',
              color: triangleMethod === 'THREE_SIDES' ? '#FFFFFF' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ✨ {getTranslation('tri_three_sides', lang)}
          </button>
        </div>
      )}

      {/* Inputs Grid based on shape */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {shape === 'RECTANGLE' && (
          <>
            {renderField('length_1', 'dim_length_1')}
            {renderField('length_2', 'dim_length_2')}
            {renderField('width_1', 'dim_width_1')}
            {renderField('width_2', 'dim_width_2')}
          </>
        )}

        {shape === 'SQUARE' && (
          <>
            {renderField('side', 'dim_side')}
            <div
              style={{
                width: '100%',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '-4px',
              }}
            >
              {lang === 'BN'
                ? '* চার বাহু সমান না হলে নিচের বিকল্প বাহুগুলো পূরণ করতে পারেন:'
                : '* If 4 sides vary slightly, you can optionally input separate sides:'}
            </div>
            {renderField('side_1', 'dim_side_1')}
            {renderField('side_2', 'dim_side_2')}
            {renderField('side_3', 'dim_side_3')}
            {renderField('side_4', 'dim_side_4')}
          </>
        )}

        {shape === 'TRIANGLE' && (
          <>
            {triangleMethod === 'BASE_HEIGHT' ? (
              <>
                {renderField('base', 'dim_base')}
                {renderField('height', 'dim_height')}
              </>
            ) : (
              <>
                {renderField('side_a', 'dim_side_a')}
                {renderField('side_b', 'dim_side_b')}
                {renderField('side_c', 'dim_side_c')}
              </>
            )}
          </>
        )}

        {shape === 'RHOMBUS' && (
          <>
            {renderField('diag_1', 'dim_diag_1')}
            {renderField('diag_2', 'dim_diag_2')}
          </>
        )}

        {shape === 'PARALLELOGRAM' && (
          <>
            {renderField('base', 'dim_base')}
            {renderField('height', 'dim_height')}
          </>
        )}

        {shape === 'TRAPEZIUM' && (
          <>
            {renderField('side_a', 'dim_parallel_a')}
            {renderField('side_b', 'dim_parallel_b')}
            {renderField('height', 'dim_height')}
          </>
        )}

        {shape === 'PENTAGON' && (
          <>
            {renderField('side_1', 'dim_side_1')}
            {renderField('side_2', 'dim_side_2')}
            {renderField('side_3', 'dim_side_3')}
            {renderField('side_4', 'dim_side_4')}
            {renderField('side_5', 'dim_side_5')}
            <div
              style={{
                width: '100%',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}
            >
              {lang === 'BN'
                ? 'অনিয়মিত পঞ্চভুজের ক্ষেত্রে ২টি কর্ণ (d1 ও d2) দিলে ৩টি ত্রিভুজে ভাগ করে নিখুঁত ক্ষেত্রফল বের হবে:'
                : 'For irregular pentagons, providing 2 diagonals (d1 & d2) computes exact area via 3 triangles:'}
            </div>
            {renderField('diag_1_pent', 'dim_diag_1_pent')}
            {renderField('diag_2_pent', 'dim_diag_2_pent')}
          </>
        )}

        {shape === 'HEXAGON' && (
          <>
            {renderField('side', 'dim_side')}
            {renderField('side_1', 'dim_side_1')}
            {renderField('side_2', 'dim_side_2')}
            {renderField('side_3', 'dim_side_3')}
            {renderField('side_4', 'dim_side_4')}
            {renderField('side_5', 'dim_side_5')}
            {renderField('side_6', 'dim_side_6')}
          </>
        )}

        {shape === 'CUBE' && (
          <>
            {renderField('side', 'dim_side')}
            {renderField('depth', 'dim_depth')}
          </>
        )}

        {shape === 'QUADRILATERAL' && (
          <>
            <div
              style={{
                width: '100%',
                fontSize: '12px',
                color: '#1B5E20',
                fontWeight: 700,
                background: 'rgba(46, 125, 50, 0.08)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            >
              {lang === 'BN'
                ? '💡 আঁকাবাঁকা ৪ বাহুর জমি মাপার ক্ষেত্রে ৪টি বাহুর পাশাপাশি কর্ণ (E) অবশ্যই মাপুন:'
                : '💡 For irregular 4-sided plots, measuring the diagonal (E) ensures 100% accuracy:'}
            </div>
            {renderField('side_a', 'dim_side_a')}
            {renderField('side_b', 'dim_side_b')}
            {renderField('side_c', 'dim_side_c')}
            {renderField('side_d', 'dim_side_d')}
            {renderField('diag_e', 'dim_diagonal')}
          </>
        )}
      </div>
    </div>
  );
};
