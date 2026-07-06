import { useState } from 'react';

/**
 * Donut SVG. segments: [{ label, value, color }]. Leyenda siempre presente.
 * Hueco entre segmentos = 2px de superficie (gap en el trazo).
 */
export default function Donut({ segments, centerLabel, formatValue }) {
  const [hover, setHover] = useState(null);
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const gap = 2; // px de separación

  let offset = 0;
  const arcs = segments.map((d, i) => {
    const frac = d.value / total;
    const len = Math.max(frac * C - gap, 0);
    const arc = {
      ...d,
      dash: `${len} ${C - len}`,
      dashoffset: -offset,
      dim: hover !== null && hover !== i,
    };
    offset += frac * C;
    return arc;
  });

  const shown = hover !== null ? segments[hover] : null;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dash}
              strokeDashoffset={a.dashoffset}
              strokeLinecap="butt"
              style={{ opacity: a.dim ? 0.32 : 1, transition: 'opacity .15s', cursor: 'pointer' }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </g>
        <text x="50%" y="47%" textAnchor="middle" className="donut-center-num" fill="var(--text-primary)">
          {shown ? shown.value : total}
        </text>
        <text x="50%" y="59%" textAnchor="middle" className="donut-center-lbl">
          {shown ? shown.label : centerLabel}
        </text>
      </svg>

      <div className="legend">
        {segments.map((d, i) => (
          <div
            className="legend-item"
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ opacity: hover !== null && hover !== i ? 0.5 : 1 }}
          >
            <span className="lg-swatch" style={{ background: d.color }} />
            {d.label}
            <span className="lg-val">{formatValue ? formatValue(d.value) : d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
