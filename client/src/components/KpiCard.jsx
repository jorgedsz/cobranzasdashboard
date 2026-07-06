export default function KpiCard({ label, value, foot, footTone, accent }) {
  return (
    <div className="card kpi">
      {accent && <div className="kpi-accent" style={{ background: accent }} />}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {foot && <div className={`kpi-foot ${footTone || ''}`}>{foot}</div>}
    </div>
  );
}
