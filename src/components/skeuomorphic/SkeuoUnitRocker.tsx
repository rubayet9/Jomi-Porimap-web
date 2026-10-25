import React from 'react';
import { AppLanguage, AppUnit } from '../../types';
import { sound } from '../../lib/sound';

interface SkeuoUnitRockerProps {
  unit: AppUnit;
  onUnitChange: (newUnit: AppUnit) => void;
  lang: AppLanguage;
  className?: string;
}

export const SkeuoUnitRocker: React.FC<SkeuoUnitRockerProps> = ({
  unit,
  onUnitChange,
  lang,
  className = '',
}) => {
  const isFeet = unit === 'FEET';

  const handleSelect = (selected: AppUnit) => {
    if (selected !== unit) {
      sound.playSwitch();
      onUnitChange(selected);
    }
  };

  return (
    <div className={`rocker-trough ${className}`}>
      {/* Feet Toggle */}
      <button
        type="button"
        onClick={() => handleSelect('FEET')}
        className={`rocker-btn ${isFeet ? 'active-feet' : ''}`}
        title={lang === 'BN' ? 'ফুট এককে রূপান্তর' : 'Switch to Feet'}
      >
        <span>📐</span>
        <span>{lang === 'BN' ? 'ফুট (FT)' : 'FEET (FT)'}</span>
      </button>

      {/* Meter Toggle */}
      <button
        type="button"
        onClick={() => handleSelect('METERS')}
        className={`rocker-btn ${!isFeet ? 'active-feet' : ''}`}
        title={lang === 'BN' ? 'মিটার এককে রূপান্তর' : 'Switch to Meters'}
      >
        <span>✏️</span>
        <span>{lang === 'BN' ? 'মিটার (M)' : 'METER (M)'}</span>
      </button>
    </div>
  );
};
