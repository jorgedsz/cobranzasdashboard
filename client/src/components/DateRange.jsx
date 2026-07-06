import { presetRange } from '../dateRange';

const PRESETS = [
  { id: 'all', label: 'Todo' },
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: '90d', label: '90 días' },
];

/** Control de rango de fechas: presets + desde/hasta personalizados. */
export default function DateRange({ value, onChange }) {
  const v = value || { from: null, to: null, preset: 'all' };
  return (
    <div className="daterange">
      {PRESETS.map((p) => (
        <button key={p.id} className={`dr-preset ${v.preset === p.id ? 'active' : ''}`} onClick={() => onChange(presetRange(p.id))}>
          {p.label}
        </button>
      ))}
      <span className="dr-sep" />
      <input
        type="date"
        className="dr-date"
        value={v.from || ''}
        max={v.to || undefined}
        onChange={(e) => onChange({ from: e.target.value || null, to: v.to, preset: 'custom' })}
      />
      <span className="dr-dash">→</span>
      <input
        type="date"
        className="dr-date"
        value={v.to || ''}
        min={v.from || undefined}
        onChange={(e) => onChange({ from: v.from, to: e.target.value || null, preset: 'custom' })}
      />
    </div>
  );
}
