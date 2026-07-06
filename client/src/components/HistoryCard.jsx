import { useMemo, useState } from 'react';
import { money, pct } from '../format';
import { EMPTY_RANGE, makeInRange } from '../dateRange';
import LineChart from './LineChart';
import DateRange from './DateRange';

const SERIES = [
  { key: 'deudaTotal', label: 'Deuda total', color: 'var(--series-1)' },
  { key: 'deudaVencida', label: 'Deuda vencida', color: 'var(--critical)' },
];

export default function HistoryCard({ history }) {
  const [range, setRange] = useState(EMPTY_RANGE);

  const daily = useMemo(() => {
    const all = history?.daily || [];
    const inRange = makeInRange(range);
    return all.filter((d) => inRange(d.date));
  }, [history, range]);

  const hasSeed = daily.some((d) => d.seeded);

  // Tendencia: último vs primero (deuda total) del rango visible.
  let trend = null;
  if (daily.length >= 2) {
    const first = daily[0].deudaTotal || 0;
    const last = daily[daily.length - 1].deudaTotal || 0;
    const deltaPct = first ? ((last - first) / first) * 100 : 0;
    trend = { deltaAbs: last - first, deltaPct, up: last >= first, dias: daily.length };
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3>Evolución de la deuda</h3>
          <div className="card-sub">Deuda total y vencida por día · tomas 4:00 y 16:00 ({history?.tz || 'local'})</div>
        </div>
        {trend && (
          <div className={`trend-chip ${trend.up ? 'bad' : 'good'}`}>
            <span className="trend-arrow">{trend.up ? '▲' : '▼'}</span>
            {trend.up ? '+' : ''}{pct(trend.deltaPct)}
            <span className="trend-sub">{money(Math.abs(trend.deltaAbs))} en {trend.dias}d</span>
          </div>
        )}
      </div>

      <div className="toolbar" style={{ padding: '12px 0 4px' }}>
        <DateRange value={range} onChange={setRange} />
      </div>

      <LineChart data={daily} series={SERIES} />

      {hasSeed && (
        <div className="chart-note">
          * Incluye datos estimados de arranque; se reemplazan automáticamente por las tomas reales de 4:00 y 16:00.
        </div>
      )}
    </div>
  );
}
