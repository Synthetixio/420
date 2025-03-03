import { intlFormat } from 'date-fns';
import React from 'react';
import numbro from 'numbro';

import data from './test.json';
const [FIRST_POINT] = data;
const [LAST_POINT] = data.slice(-1);

const POINTS = data.map((point, i) => {
  const x = (1000 / (data.length - 1)) * i; // Scale X values to fit within the SVG width (1000px viewBox width)
  const y = 300 - (point.value / LAST_POINT.value) * 300; // Scale Y values (assuming max value is 1,000,000)
  const v = point.value; // Value from data
  const ts = point.ts; // Timestamp from data
  return { x, y, v, ts }; // Push structured data to points
});
console.log(`POINTS`, POINTS);

// Helper: Find Y for a given X by interpolating the `POINTS`
function getPoint(x: number): { y: number; v: number; ts: number } {
  for (let i = 0; i < POINTS.length - 1; i++) {
    const { x: x1, y: y1 } = POINTS[i];
    const { x: x2, y: y2 } = POINTS[i + 1];
    if (x >= x1 && x <= x2) {
      // Perform linear interpolation to find the Y-value
      const t = (x - x1) / (x2 - x1); // Ratio between x1 and x2
      return {
        y: y1 + t * (y2 - y1),
        v: POINTS[i + 1].v,
        ts: POINTS[i + 1].ts,
      }; // Interpolated Y-value
    }
  }
  return { y: 300, v: 0, ts: FIRST_POINT.ts }; // Default fail-safe (zero debt repaid at bottom)
}

/**
 * @param loan Initial loan
 * @param time Total duration in time units to reduce debt to 0
 * @param pointsCount Number of points for the chart (resolution)
 * @constructor
 */

export function TvlChart() {
  const [hoverX, setHoverX] = React.useState<number | null>(null);
  const handleMouseMove = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const rectElement = event.target as SVGRectElement;
    if (rectElement) {
      const rect = rectElement.getBoundingClientRect();
      // Calculate the normalized X value relative to the SVG's viewBox
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 1000; // Scale X to viewBox scale (0 to 1000)
      setHoverX(normalizedX);
    }
  };

  const handleMouseLeave = () => {
    setHoverX(null); // Clear the hoverX when the mouse leaves the chart
  };

  return (
    <svg viewBox="-70 -70 1100 400" width="100%">
      <rect
        x="0"
        y="0"
        width="1000"
        height="300"
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      <polyline
        fill="none"
        stroke="#9999ac"
        strokeWidth="2"
        points={POINTS.map((point) => `${point.x},${point.y}`).join(' ')}
      />
      <circle cx={POINTS[0].x} cy={POINTS[0].y} r="8" fill="#9999ac" />

      {/* End of the chart (last point) */}
      <circle
        cx={POINTS[POINTS.length - 1].x}
        cy={POINTS[POINTS.length - 1].y}
        r="8"
        fill="#9999ac"
      />

      {hoverX !== null && (
        <>
          <line
            x1={hoverX}
            y1="0"
            x2={hoverX}
            y2="300"
            stroke="#aaa"
            strokeWidth="1"
            strokeDasharray="4" // Dashed line
          />
          <circle cx={hoverX} cy={getPoint(hoverX).y} r="8" fill="#9999ac" />

          <text
            x={hoverX + (hoverX > 1000 / 2 ? -20 : 20)}
            y={getPoint(hoverX).y + (hoverX > 1000 / 2 ? -20 : 20)}
            fill="#9999ac"
            fontSize="20"
            textAnchor={hoverX > 1000 / 2 ? 'end' : 'start'}
          >
            $
            {numbro(getPoint(hoverX).v).format({
              trimMantissa: true,
              thousandSeparated: true,
              average: true,
              mantissa: 1,
              spaceSeparated: true,
            })}
            ,{' '}
            {intlFormat(new Date(getPoint(hoverX).ts * 1000), {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            })}
          </text>
        </>
      )}
      <line x1="0" y1="0" x2="0" y2="330" stroke="#2d2d38" strokeWidth="1" />
      <line x1="0" y1="300" x2="1030" y2="300" stroke="#2d2d38" strokeWidth="1" />
      <line x1="1000" y1="0" x2="1000" y2="300" stroke="#fff" strokeWidth="1" strokeDasharray="5" />
      <text x="0" y="330" fill="#9999ac" fontSize="20" textAnchor="start">
        {intlFormat(new Date(FIRST_POINT.ts * 1000), {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })}
      </text>
      <text x="1000" y="330" fill="#9999ac" fontSize="20" textAnchor="end">
        {intlFormat(new Date(LAST_POINT.ts * 1000), {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })}
      </text>
      <text x="-10" y="10" fill="#9999ac" fontSize="20" textAnchor="end">
        $
        {numbro(LAST_POINT.value).format({
          trimMantissa: true,
          thousandSeparated: true,
          average: true,
          mantissa: 1,
          spaceSeparated: true,
        })}
      </text>
      <text x="-15" y="305" fill="#9999ac" fontSize="20" textAnchor="end">
        $
        {numbro(FIRST_POINT.value).format({
          trimMantissa: true,
          thousandSeparated: true,
          average: true,
          mantissa: 1,
          spaceSeparated: true,
        })}
      </text>
    </svg>
  );
}
