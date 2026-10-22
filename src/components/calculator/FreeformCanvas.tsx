import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Undo2, CheckCircle2, Crosshair } from 'lucide-react';
import { AppLanguage, AppUnit, CanvasPoint } from '../../types';
import { getTranslation } from '../../lib/translations';
import { shoelaceFormula } from '../../lib/calculations';
import { sound } from '../../lib/sound';

interface FreeformCanvasProps {
  points: CanvasPoint[];
  isClosed: boolean;
  onPointsChange: (points: CanvasPoint[], isClosed: boolean) => void;
  unit: AppUnit;
  lang: AppLanguage;
}

export const FreeformCanvas: React.FC<FreeformCanvasProps> = ({
  points,
  isClosed,
  onPointsChange,
  unit,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 360, height: 260 });

  const unitLabel = unit === 'FEET' ? 'ft' : 'm';

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: 260,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length === 0) return;

    // Draw connecting lines
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    if (isClosed && points.length >= 3) {
      ctx.closePath();
      // Fill inside polygon
      ctx.fillStyle = 'rgba(46, 125, 50, 0.22)';
      ctx.fill();
    }

    ctx.strokeStyle = isClosed ? '#2E7D32' : '#E65100';
    ctx.lineWidth = 2.5;
    ctx.setLineDash(isClosed ? [] : [4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw pins
    points.forEach((pt, index) => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = index === 0 ? '#1B5E20' : '#388E3C';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), pt.x, pt.y);

      // Coordinates text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.font = '10px Outfit, sans-serif';
      const realX = (pt.x / 10).toFixed(1);
      const realY = (pt.y / 10).toFixed(1);
      ctx.fillText(`(${realX}, ${realY})`, pt.x, pt.y - 14);
    });
  }, [points, isClosed, canvasSize]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isClosed) return; // closed boundary cannot add more pins without reopening
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sound.playClick();
    const newPoints = [...points, { x, y }];
    onPointsChange(newPoints, false);
  };

  const handleCloseBoundary = () => {
    if (points.length < 3) return;
    sound.playBeep();
    onPointsChange(points, true);
  };

  const handleUndo = () => {
    if (points.length === 0) return;
    sound.playClick();
    const newPoints = points.slice(0, -1);
    onPointsChange(newPoints, false);
  };

  const handleClear = () => {
    sound.playReset();
    onPointsChange([], false);
  };

  const calculatedArea = shoelaceFormula(points, 10);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {/* Canvas Tool Instructions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Crosshair size={14} color="#2E7D32" />
          <span>
            {isClosed
              ? getTranslation('draw_closed', lang)
              : points.length < 3
              ? getTranslation('draw_open', lang)
              : `${points.length} ${getTranslation('total_pins', lang)}`}
          </span>
        </div>

        <div style={{ fontSize: '11px', color: '#2E7D32' }}>
          {getTranslation('draw_hint', lang, unitLabel)}
        </div>
      </div>

      {/* Drafting Canvas */}
      <div
        className="drafting-canvas-frame"
        style={{
          width: '100%',
          height: `${canvasSize.height}px`,
          cursor: isClosed ? 'default' : 'crosshair',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Empty state hint */}
        {points.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📍</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1B5E20' }}>
              {getTranslation('draw_instruction', lang)}
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '10px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={handleCloseBoundary}
          disabled={points.length < 3 || isClosed}
          className="skeuo-btn skeuo-btn-green"
          style={{ padding: '8px 14px', fontSize: '13px', flex: 1 }}
        >
          <CheckCircle2 size={15} />
          <span>{getTranslation('draw_close', lang)}</span>
        </button>

        <button
          type="button"
          onClick={handleUndo}
          disabled={points.length === 0}
          className="skeuo-btn skeuo-btn-brass"
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          <Undo2 size={15} />
          <span>{getTranslation('draw_undo', lang)}</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={points.length === 0}
          className="skeuo-btn skeuo-btn-danger"
          style={{ padding: '8px 14px', fontSize: '13px' }}
        >
          <RotateCcw size={15} />
          <span>{getTranslation('draw_reset', lang)}</span>
        </button>
      </div>

      {/* Shoelace Area Preview */}
      {points.length >= 3 && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'var(--surface-plate)',
            border: '1px solid var(--border-rim)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            {lang === 'BN' ? 'সুলেস সূত্রে প্রাক্কলিত পরিমাপ:' : 'Shoelace Estimated Area:'}
          </span>
          <span style={{ color: '#2E7D32', fontSize: '14px', fontWeight: 900 }}>
            {calculatedArea.toFixed(2)} {unit === 'FEET' ? 'Sq.Ft' : 'Sq.M'}
          </span>
        </div>
      )}
    </div>
  );
};
