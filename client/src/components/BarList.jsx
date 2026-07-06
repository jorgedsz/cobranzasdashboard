/**
 * Lista de barras horizontales. Una serie -> sin leyenda (el título nombra).
 * items: [{ label, value, color, display }]  (display = valor mostrado; value = magnitud)
 */
export default function BarList({ items, formatValue }) {
  const max = Math.max(...items.map((d) => d.value), 1);
  return (
    <div className="barlist">
      {items.map((d, i) => (
        <div className="barrow" key={i} title={`${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}>
          <span className="bl-label">
            {d.color && <span className="bl-swatch" style={{ background: d.color }} />}
            {d.label}
          </span>
          <span className="bl-track">
            <span
              className="bl-fill"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color || 'var(--series-1)' }}
            />
          </span>
          <span className="bl-value">{d.display ?? (formatValue ? formatValue(d.value) : d.value)}</span>
        </div>
      ))}
    </div>
  );
}
