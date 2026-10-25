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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: isSelected
                ? '2px solid #2E7D32'
                : '1px solid var(--border-rim)',
              background: isSelected
                ? 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)'
                : 'var(--surface-plate)',
              color: isSelected ? '#1B5E20' : 'var(--text-main)',
              fontWeight: isSelected ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isSelected
                ? '0 3px 8px rgba(46, 125, 50, 0.25)'
                : 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                color: isSelected ? '#2E7D32' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item.icon}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getTranslation(item.labelKey, lang)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
