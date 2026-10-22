import React from 'react';
import { sound } from '../../lib/sound';

interface SkeuoButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  colorScheme?: 'green' | 'blue' | 'brass' | 'danger';
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const SkeuoButton: React.FC<SkeuoButtonProps> = ({
  label,
  icon,
  onClick,
  colorScheme = 'green',
  className = '',
  disabled = false,
  style,
  id,
}) => {
  const handleClick = () => {
    if (disabled) return;
    sound.playClick();
    onClick();
  };

  const schemeClass = {
    green: 'skeuo-btn-green',
    blue: 'skeuo-btn-blue',
    brass: 'skeuo-btn-brass',
    danger: 'skeuo-btn-danger',
  }[colorScheme];

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`skeuo-btn ${schemeClass} ${className}`}
      style={style}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
