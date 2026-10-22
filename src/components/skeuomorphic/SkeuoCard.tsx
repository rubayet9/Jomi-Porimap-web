import React from 'react';

interface SkeuoCardProps {
  children: React.ReactNode;
  className?: string;
  showScrews?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const SkeuoCard: React.FC<SkeuoCardProps> = ({
  children,
  className = '',
  showScrews = false,
  style,
  id,
}) => {
  return (
    <div className={`skeuo-card ${className}`} style={style} id={id}>
      {showScrews && (
        <>
          <div className="screw-rivet screw-tl" />
          <div className="screw-rivet screw-tr" />
          <div className="screw-rivet screw-bl" />
          <div className="screw-rivet screw-br" />
        </>
      )}
      {children}
    </div>
  );
};
