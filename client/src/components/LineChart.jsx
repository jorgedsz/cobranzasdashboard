import { useRef, useState } from 'react';
import { moneyShort, money } from '../format';

/**
 * Gráfica de líneas (mismo eje Y, en $). series: [{key,label,color}].
 * data: [{ date, [key]:number, ... }]. Crosshair + tooltip al pasar el mouse.
 */
export default function LineChart({ data, series, height = 240 }) {
  const [hoverX, setHoverX] = useState(null);
  const wrapRef = useRef(null);

  const W = 720; // viewBox interno; el SVG escala responsivo
  const H = height;
  const pad = { top: 16, right: 64, bottom: 28, left: 8 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  if (!data || data.length === 0) {
    return <div className="empty-state" style={{ padding: 40 }}>Aún no hay histórico. Se construye con las tomas de 4:00 y 16:00.</div>;
  }

  const allVals = data.flatMap((d) => series.map((s) => d[s.key] || 0));
  const maxV = Math.max(...allVals) * 1.08;
  const minV = 0;

  const n = data.length;
  const x = (i) => pad.left + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => pad.top + ih - ((v - minV) / (maxV - minV || 1)) * ih;

  const linePath = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d[key] || 0).toFixed(1)}`).join(' ');
  const areaPath = (key) =>
    `${linePath(key)} L ${x(n - 1).toFixed(1)} ${(pad.top + ih).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.top + ih).toFixed(1)} Z`;

  // Ticks Y (4 líneas)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minV + t * (maxV - minV));
  // Ticks X (~6 fechas)
  const step = Math.max(1, Math.ceil(n / 6));
  const xTicks = data.map((d, i) => ({ i, d })).filter(({ i }) => i % step === 0 || i === n - 1);

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    for (let i = 0; i < n; i++) { const d = Math.abs(x(i) - px); if (d < bd) { bd = d; best = i; } }
    setHoverX(best);
  };

  const hd = hoverX != null ? data[hoverX] : null;
  const fmtDate = (s) => {
    try { return new Date(s + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }); }
    catch { return s; }
  };

  return (
    <div className="linechart" ref={wrapRef} style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} onMouseMove={onMove} onMouseLeave={() => setHoverX(null)}>
        {/* grid + etiquetas Y */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.left} x2={pad.left + iw} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth="1" />
            <text x={pad.left + iw + 6} y={y(v) + 4} fontSize="11" fill="var(--text-muted)">{moneyShort(v)}</text>
          </g>
        ))}
        {/* etiquetas X */}
        {xTicks.map(({ i, d }) => (
          <text key={i} x={x(i)} y={H - 8} fontSize="11" fill="var(--text-muted)" textAnchor="middle">{fmtDate(d.date)}</text>
        ))}

        {/* áreas + líneas */}
        {series.map((s) => (
          <g key={s.key}>
            <path d={areaPath(s.key)} fill={s.color} opacity="0.08" />
            <path d={linePath(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* etiqueta directa al final */}
            <text x={x(n - 1) + 6} y={y(data[n - 1][s.key] || 0) + 4} fontSize="11" fontWeight="600" fill={s.color}>
              {moneyShort(data[n - 1][s.key] || 0)}
            </text>
          </g>
        ))}

        {/* crosshair + puntos */}
        {hd && (
          <g>
            <line x1={x(hoverX)} x2={x(hoverX)} y1={pad.top} y2={pad.top + ih} stroke="var(--baseline)" strokeWidth="1" strokeDasharray="3 3" />
            {series.map((s) => (
              <circle key={s.key} cx={x(hoverX)} cy={y(hd[s.key] || 0)} r="4" fill={s.color} stroke="var(--surface-1)" strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>

      {hd && (
        <div className="lc-tooltip" style={{ left: `${(x(hoverX) / W) * 100}%` }}>
          <div className="lc-tt-date">{fmtDate(hd.date)}{hd.seeded ? ' · estimado' : ''}</div>
          {series.map((s) => (
            <div key={s.key} className="lc-tt-row">
              <span className="lc-tt-sw" style={{ background: s.color }} />
              {s.label}<span className="lc-tt-val">{money(hd[s.key] || 0)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="legend-row">
        {series.map((s) => (
          <span key={s.key} className="legend-item" style={{ flex: 'none' }}>
            <span className="lg-swatch" style={{ background: s.color }} />{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
