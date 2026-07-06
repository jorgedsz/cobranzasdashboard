import { money } from '../format';

export default function AiPanel({ analysis }) {
  if (!analysis) return null;
  return (
    <div className="ai-grid">
      <div className="card">
        <h3>Resumen ejecutivo</h3>
        <div className="card-sub">
          Generado por {analysis.generado_por === 'openai' ? `IA · ${analysis.modelo}` : 'heurística (sin API key)'}
        </div>
        <p className="ai-summary" dangerouslySetInnerHTML={{ __html: highlight(analysis.resumen_ejecutivo) }} />
        {analysis.aviso && (
          <p style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: 8 }}>⚠ {analysis.aviso}</p>
        )}
      </div>

      <div className="card">
        <h3>Recuperación estimada</h3>
        <div className="card-sub">Suma de montos esperados ponderados por probabilidad de pago</div>
        <div className="big-recover">
          <span className="cur">{money(analysis.recuperacion_estimada)}</span>
        </div>
        <h3 style={{ marginTop: 20, fontSize: '0.88rem' }}>Riesgos detectados</h3>
        <ul className="risk-list" style={{ marginTop: 10 }}>
          {(analysis.riesgos || []).map((r, i) => (
            <li key={i}>
              <span className="risk-ic">!</span>
              <span>{r}</span>
            </li>
          ))}
          {(!analysis.riesgos || analysis.riesgos.length === 0) && (
            <li style={{ color: 'var(--text-muted)' }}>Sin riesgos relevantes detectados.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Resalta cifras $ y números clave.
function highlight(text) {
  if (!text) return '';
  const esc = text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  return esc.replace(/(\$[\d,.]+|\b\d+\b)/g, '<strong>$1</strong>');
}
