'use client';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

/**
 * SVG line chart matching design/statistics.html style: rounded line caps,
 * subtle ambient glow, minimal grid. Renders the full dataset with auto-scale.
 */
export function LineChart({ data, color = 'rgb(186, 104, 200)', height = 200 }: LineChartProps) {
  if (data.length === 0) return <EmptyState height={height} />;

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const width = 800;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const stepX = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartHeight - (d.value / maxVal) * chartHeight,
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Horizontal grid lines */}
      {[0, 0.5, 1].map((frac) => {
        const y = padding.top + chartHeight - frac * chartHeight;
        return (
          <line
            key={frac}
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Line path with ambient glow */}
      <defs>
        <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#line-glow)"
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
      ))}

      {/* X-axis labels (show every ~7th day for 30-day) */}
      {data.map((d, i) => {
        if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
        return (
          <text
            key={i}
            x={padding.left + i * stepX}
            y={height - 10}
            fill="rgba(255,255,255,0.6)"
            fontSize="12"
            textAnchor="middle"
          >
            {d.label.slice(5)} {/* MM-DD */}
          </text>
        );
      })}

      {/* Y-axis labels */}
      {[0, Math.round(maxVal / 2), maxVal].map((val, idx) => {
        const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
        return (
          <text
            key={idx}
            x={padding.left - 10}
            y={y + 4}
            fill="rgba(255,255,255,0.6)"
            fontSize="12"
            textAnchor="end"
          >
            {val}
          </text>
        );
      })}
    </svg>
  );
}

function EmptyState({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-surface-container-low"
      style={{ height }}
    >
      <p className="font-body-md text-outline">No data yet — start learning!</p>
    </div>
  );
}
