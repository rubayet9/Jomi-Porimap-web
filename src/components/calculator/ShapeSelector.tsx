import React from 'react';
import {
  RectangleHorizontal,
  Square,
  Triangle,
  Diamond,
  Spline,
  Pentagon,
  Hexagon,
  Box,
  Shapes,
  PencilRuler,
} from 'lucide-react';
import { AppLanguage, LandShape } from '../../types';
import { getTranslation } from '../../lib/translations';
import { sound } from '../../lib/sound';

interface ShapeSelectorProps {
  selectedShape: LandShape;
  onSelectShape: (shape: LandShape) => void;
  lang: AppLanguage;
}

interface ShapeItem {
  key: LandShape;
  icon: React.ReactNode;
  labelKey: string;
}

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  selectedShape,
  onSelectShape,
  lang,
}) => {
  const shapes: ShapeItem[] = [
    { key: 'RECTANGLE', icon: <RectangleHorizontal size={18} />, labelKey: 'shape_rectangle' },
    { key: 'TRIANGLE', icon: <Triangle size={18} />, labelKey: 'shape_triangle' },
    { key: 'PENTAGON', icon: <Pentagon size={18} />, labelKey: 'shape_pentagon' },
    { key: 'HEXAGON', icon: <Hexagon size={18} />, labelKey: 'shape_hexagon' },
    { key: 'QUADRILATERAL', icon: <Shapes size={18} />, labelKey: 'shape_quadrilateral' },
    { key: 'FREEFORM', icon: <PencilRuler size={18} />, labelKey: 'shape_freeform' },
  ];

  const handleSelect = (shape: LandShape) => {
    sound.playClick();
    onSelectShape(shape);
  };

  return (
    <div
      className="shape-selector-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '8px',
        width: '100%',
      }}
    >
      {shapes.map((item) => {
        const isSelected = selectedShape === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => handleSelect(item.key)}
            className={`shape-selector-btn ${isSelected ? 'selected' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 14px',
              borderRadius: '14px',
              border: isSelected
                ? '1.5px solid #10B981'
                : '1px solid var(--border-rim)',
              background: isSelected
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.24) 100%)'
                : 'var(--surface-plate)',
              color: isSelected ? 'var(--emerald-deep)' : 'var(--text-main)',
              fontWeight: isSelected ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isSelected
                ? '0 6px 16px rgba(16, 185, 129, 0.24), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
                : 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                color: isSelected ? '#10B981' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s ease',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: isSelected ? 800 : 600,
              }}
            >
              {getTranslation(item.labelKey, lang)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
