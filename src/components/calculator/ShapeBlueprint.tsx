import React from 'react';
import { AppLanguage, LandShape, TriangleMethod } from '../../types';
import { getTranslation } from '../../lib/translations';

interface ShapeBlueprintProps {
  shape: LandShape;
  inputs: Record<string, string>;
  triangleMethod: TriangleMethod;
  unitLabel: string;
  lang: AppLanguage;
}

export const ShapeBlueprint: React.FC<ShapeBlueprintProps> = ({
  shape,
  inputs,
  triangleMethod,
  unitLabel,
  lang,
}) => {
  // SVG Canvas dimensions
  const width = 360;
  const height = 230;
  const cx = width / 2;
  const cy = height / 2;

  const strokeColor = '#2E7D32';
  const fillColor = 'rgba(46, 125, 50, 0.12)';
  const dashedStroke = 'rgba(46, 125, 50, 0.45)';
  const labelColor = '#1B5E20';
  const textColor = '#2E7D32';

  const renderShapeContent = () => {
    switch (shape) {
      case 'RECTANGLE': {
        const rw = 200;
        const rh = 120;
        const x = cx - rw / 2;
        const y = cy - rh / 2;
        const l1 = inputs['length_1'] || inputs['length'] || 'L1';
        const l2 = inputs['length_2'] || 'L2';
        const w1 = inputs['width_1'] || inputs['width'] || 'W1';
        const w2 = inputs['width_2'] || 'W2';

        return (
          <g>
            <rect
              x={x}
              y={y}
              width={rw}
              height={rh}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
              rx="4"
            />
            {/* Top (Length 1) */}
            <text x={cx} y={y - 10} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              {l1} {unitLabel} ({getTranslation('dim_length_1', lang)})
            </text>
            {/* Bottom (Length 2) */}
            <text x={cx} y={y + rh + 18} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              {l2} {unitLabel} ({getTranslation('dim_length_2', lang)})
            </text>
            {/* Left (Width 1) */}
            <text
              x={x - 10}
              y={cy}
              textAnchor="middle"
              fill={labelColor}
              fontSize="12"
              fontWeight="700"
              transform={`rotate(-90 ${x - 10} ${cy})`}
            >
              {w1} {unitLabel}
            </text>
            {/* Right (Width 2) */}
            <text
              x={x + rw + 14}
              y={cy}
              textAnchor="middle"
              fill={labelColor}
              fontSize="12"
              fontWeight="700"
              transform={`rotate(90 ${x + rw + 14} ${cy})`}
            >
              {w2} {unitLabel}
            </text>
          </g>
        );
      }

      case 'SQUARE': {
        const size = 130;
        const x = cx - size / 2;
        const y = cy - size / 2;
        const s = inputs['side'] || inputs['side_1'] || 'Side';

        return (
          <g>
            <rect
              x={x}
              y={y}
              width={size}
              height={size}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2.5"
              rx="4"
            />
            <text x={cx} y={y - 10} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              {s} {unitLabel}
            </text>
            <text
              x={x - 10}
              y={cy}
              textAnchor="middle"
              fill={labelColor}
              fontSize="12"
              fontWeight="700"
              transform={`rotate(-90 ${x - 10} ${cy})`}
            >
              {s} {unitLabel}
            </text>
          </g>
        );
      }

      case 'TRIANGLE': {
        if (triangleMethod === 'BASE_HEIGHT') {
          const bw = 220;
          const bh = 130;
          const p1 = `${cx - bw / 2},${cy + bh / 2}`;
          const p2 = `${cx + bw / 2},${cy + bh / 2}`;
          const p3 = `${cx - bw / 2},${cy - bh / 2}`;
          const b = inputs['base'] || 'Base';
          const h = inputs['height'] || 'Height';

          return (
            <g>
              <polygon points={`${p1} ${p2} ${p3}`} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
              {/* Base */}
              <text x={cx} y={cy + bh / 2 + 18} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
                {b} {unitLabel} ({getTranslation('dim_base', lang)})
              </text>
              {/* Height */}
              <text
                x={cx - bw / 2 - 12}
                y={cy}
                textAnchor="middle"
                fill={labelColor}
                fontSize="12"
                fontWeight="700"
                transform={`rotate(-90 ${cx - bw / 2 - 12} ${cy})`}
              >
                {h} {unitLabel} ({getTranslation('dim_height', lang)})
              </text>
            </g>
          );
        } else {
          // Heron 3 sides
          const bw = 210;
          const bh = 130;
          const p1 = `${cx - bw / 2},${cy + bh / 2}`;
          const p2 = `${cx + bw / 2},${cy + bh / 2}`;
          const p3 = `${cx - 20},${cy - bh / 2}`;
          const a = inputs['side_a'] || 'A';
          const b = inputs['side_b'] || 'B';
          const c = inputs['side_c'] || 'C';

          return (
            <g>
              <polygon points={`${p1} ${p2} ${p3}`} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
              <text x={cx - 70} y={cy - 10} fill={labelColor} fontSize="12" fontWeight="700">
                A: {a} {unitLabel}
              </text>
              <text x={cx + 40} y={cy - 10} fill={labelColor} fontSize="12" fontWeight="700">
                B: {b} {unitLabel}
              </text>
              <text x={cx} y={cy + bh / 2 + 18} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
                C: {c} {unitLabel}
              </text>
            </g>
          );
        }
      }

      case 'RHOMBUS': {
        const d1 = 180;
        const d2 = 110;
        const p1 = `${cx},${cy - d2 / 2}`;
        const p2 = `${cx + d1 / 2},${cy}`;
        const p3 = `${cx},${cy + d2 / 2}`;
        const p4 = `${cx - d1 / 2},${cy}`;
        const diag1 = inputs['diag_1'] || 'd1';
        const diag2 = inputs['diag_2'] || 'd2';

        return (
          <g>
            <polygon points={`${p1} ${p2} ${p3} ${p4}`} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <line
              x1={cx - d1 / 2}
              y1={cy}
              x2={cx + d1 / 2}
              y2={cy}
              stroke={dashedStroke}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <line
              x1={cx}
              y1={cy - d2 / 2}
              x2={cx}
              y2={cy + d2 / 2}
              stroke={dashedStroke}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={cx} y={cy - 6} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              d1: {diag1} {unitLabel}
            </text>
            <text x={cx + 12} y={cy + 30} fill={labelColor} fontSize="12" fontWeight="700">
              d2: {diag2} {unitLabel}
            </text>
          </g>
        );
      }

      case 'PARALLELOGRAM': {
        const bw = 170;
        const bh = 110;
        const skew = 45;
        const p1 = `${cx - bw / 2 + skew / 2},${cy - bh / 2}`;
        const p2 = `${cx + bw / 2 + skew / 2},${cy - bh / 2}`;
        const p3 = `${cx + bw / 2 - skew / 2},${cy + bh / 2}`;
        const p4 = `${cx - bw / 2 - skew / 2},${cy + bh / 2}`;
        const b = inputs['base'] || 'Base';
        const h = inputs['height'] || 'Height';

        return (
          <g>
            <polygon points={`${p1} ${p2} ${p3} ${p4}`} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <line
              x1={cx - bw / 2 + skew / 2}
              y1={cy - bh / 2}
              x2={cx - bw / 2 + skew / 2}
              y2={cy + bh / 2}
              stroke={dashedStroke}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={cx} y={cy + bh / 2 + 18} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              {b} {unitLabel} ({getTranslation('dim_base', lang)})
            </text>
            <text x={cx - bw / 2 + skew / 2 + 8} y={cy} fill={labelColor} fontSize="12" fontWeight="700">
              {h} {unitLabel}
            </text>
          </g>
        );
      }

      case 'TRAPEZIUM': {
        const topW = 120;
        const botW = 210;
        const bh = 110;
        const p1 = `${cx - topW / 2},${cy - bh / 2}`;
        const p2 = `${cx + topW / 2},${cy - bh / 2}`;
        const p3 = `${cx + botW / 2},${cy + bh / 2}`;
        const p4 = `${cx - botW / 2},${cy + bh / 2}`;
        const a = inputs['side_a'] || 'A';
        const b = inputs['side_b'] || 'B';
        const h = inputs['height'] || 'Height';

        return (
          <g>
            <polygon points={`${p1} ${p2} ${p3} ${p4}`} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <text x={cx} y={cy - bh / 2 - 8} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              A: {a} {unitLabel}
            </text>
            <text x={cx} y={cy + bh / 2 + 18} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              B: {b} {unitLabel}
            </text>
            <line
              x1={cx - topW / 2}
              y1={cy - bh / 2}
              x2={cx - topW / 2}
              y2={cy + bh / 2}
              stroke={dashedStroke}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x={cx - topW / 2 + 8} y={cy} fill={labelColor} fontSize="12" fontWeight="700">
              h: {h}
            </text>
          </g>
        );
      }

      case 'QUADRILATERAL': {
        // Irregular 4-sided with diagonal E
        const p1 = `${cx - 90},${cy - 50}`;
        const p2 = `${cx + 80},${cy - 60}`;
        const p3 = `${cx + 95},${cy + 55}`;
        const p4 = `${cx - 85},${cy + 65}`;
        const a = inputs['side_a'] || 'A';
        const b = inputs['side_b'] || 'B';
        const c = inputs['side_c'] || 'C';
        const d = inputs['side_d'] || 'D';
        const e = inputs['diag_e'] || 'E';

        return (
          <g>
            <polygon points={`${p1} ${p2} ${p3} ${p4}`} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            {/* Diagonal E from p1 to p3 */}
            <line
              x1={cx - 90}
              y1={cy - 50}
              x2={cx + 95}
              y2={cy + 55}
              stroke="#D32F2F"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <text x={cx - 10} y={cy - 60} fill={labelColor} fontSize="12" fontWeight="700">
              A: {a} {unitLabel}
            </text>
            <text x={cx + 95} y={cy} fill={labelColor} fontSize="12" fontWeight="700">
              B: {b}
            </text>
            <text x={cx} y={cy + 75} fill={labelColor} fontSize="12" fontWeight="700">
              C: {c} {unitLabel}
            </text>
            <text x={cx - 110} y={cy + 10} fill={labelColor} fontSize="12" fontWeight="700">
              D: {d}
            </text>
            <text x={cx + 10} y={cy} fill="#D32F2F" fontSize="12" fontWeight="900">
              E: {e} ({getTranslation('dim_diagonal', lang)})
            </text>
          </g>
        );
      }

      case 'CUBE': {
        // Isometric 3D box representing excavation
        const s = inputs['side'] || 'Side';
        const d = inputs['depth'] || s;
        return (
          <g>
            {/* Top face */}
            <polygon
              points={`${cx},${cy - 60} ${cx + 70},${cy - 25} ${cx},${cy + 10} ${cx - 70},${cy - 25}`}
              fill="rgba(46, 125, 50, 0.22)"
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Left face */}
            <polygon
              points={`${cx - 70},${cy - 25} ${cx},${cy + 10} ${cx},${cy + 70} ${cx - 70},${cy + 35}`}
              fill="rgba(46, 125, 50, 0.14)"
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Right face */}
            <polygon
              points={`${cx},${cy + 10} ${cx + 70},${cy - 25} ${cx + 70},${cy + 35} ${cx},${cy + 70}`}
              fill="rgba(46, 125, 50, 0.08)"
              stroke={strokeColor}
              strokeWidth="2"
            />
            <text x={cx} y={cy - 70} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              {s} {unitLabel}
            </text>
            <text x={cx + 80} y={cy + 10} fill={labelColor} fontSize="12" fontWeight="700">
              {getTranslation('dim_depth', lang)}: {d} {unitLabel}
            </text>
          </g>
        );
      }

      case 'PENTAGON': {
        const r = 70;
        const pts = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        return (
          <g>
            <polygon points={pts.join(' ')} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <text x={cx} y={cy + 95} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              5-Sided Polygon (পঞ্চভুজ)
            </text>
          </g>
        );
      }

      case 'HEXAGON': {
        const r = 70;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6;
          pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        return (
          <g>
            <polygon points={pts.join(' ')} fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
            <text x={cx} y={cy + 95} textAnchor="middle" fill={labelColor} fontSize="12" fontWeight="700">
              6-Sided Regular Polygon (ষড়ভুজ)
            </text>
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="drafting-canvas-frame" style={{ width: '100%', height: `${height}px` }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Drafting Ruler Border Markers */}
        <g opacity="0.6">
          <line x1="0" y1="5" x2={width} y2="5" stroke="#2E7D32" strokeWidth="0.5" strokeDasharray="5 5" />
          <line x1="5" y1="0" x2="5" y2={height} stroke="#2E7D32" strokeWidth="0.5" strokeDasharray="5 5" />
          <text x="12" y="15" fill={textColor} fontSize="9" fontWeight="800">
            BLUEPRINT GRID (10px = 1 {unitLabel})
          </text>
        </g>

        {renderShapeContent()}
      </svg>
    </div>
  );
};
