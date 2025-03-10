import { intlFormat } from 'date-fns';
import numbro from 'numbro';
import React from 'react';

export function TvlChart({
  data,
  config = {
    width: 1000,
    height: 380,
    fontSize: 30,
  },
}: {
  data: { ts: Date; value: number }[];
  config?: {
    width: number;
    height: number;
    fontSize: number;
  };
}) {
  const [hover, setHover] = React.useState<{ x: number; y: number } | null>(null);
  const handleMouseMove = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const rectElement = event.target as SVGRectElement;
    if (rectElement) {
      const rect = rectElement.getBoundingClientRect();
      // Calculate the normalized X value relative to the SVG's viewBox
      const normalizedX = ((event.clientX - rect.left) / rect.width) * config.width; // Scale X to viewBox scale (0 to config.width)
      const normalizedY = ((event.clientX - rect.left) / rect.width) * config.height; // Scale X to viewBox scale (0 to config.width)
      setHover({ x: normalizedX, y: normalizedY });
    }
  };

  const handleMouseLeave = () => {
    setHover(null); // Clear the hoverX when the mouse leaves the chart
  };

  const POINTS = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data.map((point, i): { x: number; y: number; v: number; ts: Date } => {
      const x = (config.width / (data.length - 1)) * i; // Scale X values to fit within the SVG width (1000px viewBox width)
      const y = config.height - (point.value / data[data.length - 1].value) * config.height; // Scale Y values (assuming max value is 1,000,000)
      const v = point.value; // Value from data
      const ts = point.ts; // Timestamp from data
      return { x, y, v, ts }; // Push structured data to points
    });
  }, [data, config]);
  const [FIRST_POINT] = POINTS;
  const [LAST_POINT] = POINTS.slice(-1);

  // Helper: Find Y for a given X by interpolating the `POINTS`
  const getPoint = React.useCallback(
    (
      x: number
    ): {
      x: number;
      y: number;
      v: number;
      ts: Date;
    } => {
      for (let i = 0; i < POINTS.length - 1; i++) {
        const { x: x1, y: y1 } = POINTS[i];
        const { x: x2, y: y2 } = POINTS[i + 1];
        if (x >= x1 && x <= x2 && POINTS[i + 1]) {
          // Perform linear interpolation to find the Y-value
          const t = (x - x1) / (x2 - x1); // Ratio between x1 and x2
          return {
            ...POINTS[i + 1],
            x,
            y: y1 + t * (y2 - y1),
          };
        }
      }
      if (x > config.width / 2 && LAST_POINT) {
        return LAST_POINT;
      }
      if (x < config.width / 2 && FIRST_POINT) {
        return FIRST_POINT;
      }
      // Default fail-safe
      return { x: 0, y: config.height, v: 0, ts: new Date() };
    },
    [POINTS, config, FIRST_POINT, LAST_POINT]
  );

  return (
    <svg
      viewBox={`-100 -20 ${config.width + 100 + 20} ${config.height + config.fontSize + 20 + 20}`}
      width="100%"
      aria-label="TVL Chart"
      role="img"
    >
      {POINTS.length > 0 ? (
        <>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={config.height}
            stroke="#2d2d38"
            strokeWidth="3"
            // strokeDasharray="5"
          />
          <defs>
            <linearGradient id="gradientFill" x1={0} y1={0} x2={0} y2={1}>
              {/* Opaque color at the top */}
              <stop offset="0%" stopColor="#00D1FF" stopOpacity="1" />
              {/* Transparent at the bottom */}
              <stop offset="100%" stopColor="#00D1FF" stopOpacity="0.04" />{' '}
            </linearGradient>
          </defs>
          {/* Stroke Path (Smooth line) */}
          <path
            fill="none" // No fill for the stroke line
            stroke="#00D1FF"
            strokeWidth="2"
            d={`
              M ${POINTS[0].x},${POINTS[0].y}
              ${POINTS.slice(1)
                .map(
                  (point, i) =>
                    `C ${POINTS[i].x + (point.x - POINTS[i].x) / 2},${POINTS[i].y} ` +
                    `${point.x - (point.x - POINTS[i].x) / 2},${point.y} ` +
                    `${point.x},${point.y}`
                )
                .join(' ')}
            `}
          />

          {/* Area Fill (without bottom return line) */}
          <path
            fill="url(#gradientFill)" // Link to the gradient
            stroke="none" // No stroke for the fill
            d={`
              M ${POINTS[0].x},${POINTS[0].y} 
              ${POINTS.slice(1)
                .map(
                  (point, i) =>
                    `C ${POINTS[i].x + (point.x - POINTS[i].x) / 2},${POINTS[i].y} ` +
                    `${point.x - (point.x - POINTS[i].x) / 2},${point.y} ` +
                    `${point.x},${point.y}`
                )
                .join(' ')}
              L ${POINTS[POINTS.length - 1].x},${config.height} 
              L ${POINTS[0].x},${config.height} 
              Z
            `}
          />
        </>
      ) : (
        <>
          <line x1="0" y1="0" x2="0" y2={config.height} stroke="#2D2D38" strokeWidth="1" />
          <line
            x1="0"
            y1={config.height}
            x2={config.width}
            y2={config.height}
            stroke="#2d2d38"
            strokeWidth="1"
          />
        </>
      )}

      {FIRST_POINT ? (
        <text
          x={10}
          y={config.height + config.fontSize + 10}
          fill="#9999ac"
          fontSize={config.fontSize}
          textAnchor="start"
        >
          {intlFormat(FIRST_POINT.ts, {
            year: '2-digit',
            month: 'short',
          })}
        </text>
      ) : null}
      {LAST_POINT ? (
        <text
          x={config.width - 10}
          y={config.height + config.fontSize + 10}
          fill="#9999ac"
          fontSize={config.fontSize}
          textAnchor="end"
        >
          {intlFormat(LAST_POINT.ts, {
            year: '2-digit',
            month: 'short',
          })}
        </text>
      ) : null}
      {LAST_POINT ? (
        <text
          x="-15"
          y={config.fontSize - 3}
          fill="#9999ac"
          fontSize={config.fontSize}
          textAnchor="end"
        >
          {`${numbro(LAST_POINT.v).format({
            trimMantissa: true,
            thousandSeparated: true,
            average: true,
            mantissa: 0,
            spaceSeparated: false,
          })}`}
        </text>
      ) : null}
      {/*
      {FIRST_POINT ? (
        <text x="-15" y="307" fill="#9999ac" fontSize={config.fontSize} textAnchor="end">
          {`${numbro(FIRST_POINT.v).format({
            trimMantissa: true,
            thousandSeparated: true,
            average: true,
            mantissa: 0,
            spaceSeparated: false,
          })}`}
        </text>
      ) : null}
      */}

      {hover !== null ? (
        <>
          {/*
          <line
            x1={hover.x}
            y1="0"
            x2={hover.x}
            y2={config.height}
            stroke="#aaa"
            strokeWidth="1"
            strokeDasharray="4" // Dashed line
          />
          */}

          <circle cx={hover.x} cy={getPoint(hover.x).y} r="16" fill="#5CE1FF" />

          <g
            transform={`translate(${[
              hover.x + (hover.x > config.width / 2 ? -config.fontSize * 10 - 20 : 20),
              getPoint(hover.x).y +
                (getPoint(hover.x).y > config.height / 2 ? -config.fontSize * 1.5 * 3 - 20 : 20),
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
              {intlFormat(getPoint(hover.x).ts, {
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
              {`${numbro(getPoint(hover.x).v).format({
                trimMantissa: true,
                thousandSeparated: true,
                average: false,
                mantissa: 0,
                spaceSeparated: false,
              })} SNX`}
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
