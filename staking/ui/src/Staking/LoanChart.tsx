import { intlFormat } from 'date-fns';
import numbro from 'numbro';
import React from 'react';

// Quadratic Debt Decay Function: Calculates current debt at a given timestamp
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _calculateLoanQuadraticDecay = (
  timestamp: number,
  initialLoan: number,
  totalTime: number
): number => {
  // Ensure timestamp does not exceed totalTime
  const clampedTime = Math.min(timestamp, totalTime);

  // Quadratic decay formula: y = initialLoan * (1 - (t / totalTime)²)
  const normalizedTime = clampedTime / totalTime; // Scales time from 0 to 1
  return initialLoan * (1 - normalizedTime ** 2); // Quadratic decay
};

// Linear Debt Decay Function: Calculates current debt at a given timestamp
const calculateLoanRepaid = (timestamp: number, initialLoan: number, totalTime: number): number => {
  // Ensure timestamp does not exceed totalTime
  const clampedTime = Math.min(timestamp, totalTime);

  // Linear repayment formula: repaidPercentage = (t / totalTime)
  const normalizedTime = clampedTime / totalTime; // Scales time from 0 to 1
  return initialLoan * normalizedTime; // Linear decay
};

export function LoanChart({
  loan,
  startTime,
  duration,
  pointsCount,
  config = {
    width: 1000,
    height: 350,
    fontSize: 30,
  },
}: {
  loan: number;
  startTime: number;
  duration: number;
  pointsCount: number;
  config?: {
    width: number;
    height: number;
    fontSize: number;
  };
}) {
  // Generate the points for the chart line
  const POINTS = React.useMemo(() => {
    const points = [];
    const interval = duration / pointsCount; // Time interval between points

    for (let i = 0; i <= pointsCount; i++) {
      const x = (config.width / pointsCount) * i; // Scale X values to fit within the SVG width
      const ts = interval * i; // Current ts
      const value = calculateLoanRepaid(ts, loan, duration);
      const y = config.height - (value / loan) * config.height; // Invert Y mapping (0% = bottom)
      points.push({ x, y, v: value, ts: ts + startTime });
    }

    return points;
  }, [duration, loan, pointsCount, startTime, config]);

  const [hoverX, setHoverX] = React.useState<number | null>(null);
  const handleMouseMove = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const rectElement = event.target as SVGRectElement;
    if (rectElement) {
      const rect = rectElement.getBoundingClientRect();
      // Calculate the normalized X value relative to the SVG's viewBox
      const normalizedX = ((event.clientX - rect.left) / rect.width) * config.width; // Scale X to viewBox scale (0 to config.width)
      setHoverX(normalizedX);
    }
  };

  const handleMouseLeave = () => {
    setHoverX(null); // Clear the hoverX when the mouse leaves the chart
  };

  // Helper: Find Y for a given X by interpolating the `POINTS`
  const getPoint = React.useCallback(
    (x: number): { y: number; v: number; ts: number } => {
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
      return { y: config.height, v: 0, ts: startTime }; // Default fail-safe (zero debt repaid at bottom)
    },
    [POINTS, startTime, config]
  );

  return (
    <svg
      viewBox={`-100 -60 ${config.width + 100 + 20} ${config.height + 60 + config.fontSize + 20}`}
      width="100%"
      aria-label="Debt Burn Chart"
      role="img"
    >
      <line x1={-3} y1={0} x2={3} y2={0} stroke="#2d2d38" strokeWidth="1" />
      <line
        x1={config.width}
        y1={config.height - 3}
        x2={config.width}
        y2={config.height + 3}
        stroke="#2d2d38"
        strokeWidth="1"
      />
      <line x1={0} y1={0} x2={0} y2={config.height} stroke="#2d2d38" strokeWidth="1" />
      <line
        x1={0}
        y1={config.height}
        x2="1010"
        y2={config.height}
        stroke="#2d2d38"
        strokeWidth="1"
      />
      <line
        x1={config.width}
        y1={0}
        x2={config.width}
        y2={config.height}
        stroke="#fff"
        strokeWidth="1"
        strokeDasharray="5"
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

      <text
        x={10}
        y={config.height + config.fontSize + 10}
        fill="#9999ac"
        fontSize={config.fontSize}
        textAnchor="start"
      >
        {intlFormat(new Date(startTime * 1000), {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </text>
      <text
        x={config.width - 10}
        y={config.height + config.fontSize + 10}
        fill="#9999ac"
        fontSize={config.fontSize}
        textAnchor="end"
      >
        {intlFormat(new Date((startTime + duration) * 1000), {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </text>
      <text
        x={-15}
        y={config.fontSize / 2 - 5}
        fill="#9999ac"
        fontSize={config.fontSize}
        textAnchor="end"
      >
        {loan
          ? `$${numbro(loan).format({
              trimMantissa: true,
              thousandSeparated: true,
              average: true,
              mantissa: 0,
              spaceSeparated: false,
            })}`
          : '100%'}
      </text>
      <text
        x={-15}
        y={config.height + config.fontSize / 2 - 5}
        fill="#9999ac"
        fontSize={config.fontSize}
        textAnchor="end"
      >
        {loan
          ? `$${numbro(0).format({
              trimMantissa: true,
              thousandSeparated: true,
              average: true,
              mantissa: 0,
              spaceSeparated: false,
            })}`
          : '0%'}
      </text>

      {hoverX !== null ? (
        <>
          <line
            x1={hoverX}
            y1={0}
            x2={hoverX}
            y2={config.height}
            stroke="#aaa"
            strokeWidth="1"
            strokeDasharray="4" // Dashed line
          />
          <circle cx={hoverX} cy={getPoint(hoverX).y} r="8" fill="#9999ac" />

          <g
            transform={`translate(${[
              hoverX + (hoverX > config.width / 2 ? -config.fontSize * 10 - 20 : 20),
              getPoint(hoverX).y +
                (getPoint(hoverX).y > config.height / 2 ? -config.fontSize * 1.5 * 3 - 20 : 20),
            ].join(',')})`}
          >
            <rect
              x={0}
              y={0}
              width={config.fontSize * 10}
              height={config.fontSize * 1.5 * 3}
              rx="10"
              ry="10"
              fill="#06061B99"
            />

            <text
              x={config.fontSize * 5}
              y={config.fontSize * 1.5}
              fill="#9999AC"
              fontSize={config.fontSize * 0.9}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {intlFormat(new Date(getPoint(hoverX).ts * 1000), {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </text>

            <text
              x={config.fontSize * 5}
              y={config.fontSize * 1.5 * 2}
              fill="#FFFFFF"
              fontSize={config.fontSize}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {`$${numbro(getPoint(hoverX).v).format({
                trimMantissa: true,
                thousandSeparated: true,
                average: false,
                mantissa: 2,
                spaceSeparated: false,
              })}`}
            </text>
          </g>
        </>
      ) : null}

      <rect
        x={0}
        y={0}
        width={config.width}
        height={config.height}
        fill="transparent"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </svg>
  );
}
