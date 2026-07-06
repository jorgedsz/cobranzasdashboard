// Utilidades de rango de fechas. from/to son 'YYYY-MM-DD' (o null = sin límite).

export const EMPTY_RANGE = { from: null, to: null, preset: 'all' };

const ymd = (dt) => dt.toLocaleDateString('en-CA'); // YYYY-MM-DD local

export function presetRange(id) {
  if (id === 'all') return { from: null, to: null, preset: 'all' };
  const today = new Date();
  const days = { '7d': 6, '30d': 29, '90d': 89 }[id];
  if (days == null) return EMPTY_RANGE;
  const from = new Date(today.getTime() - days * 86400000);
  return { from: ymd(from), to: ymd(today), preset: id };
}

// Normaliza cualquier fecha (ISO o 'YYYY-MM-DD') a 'YYYY-MM-DD' local.
function toYMD(v) {
  if (!v) return '';
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dt = new Date(s);
  return isNaN(dt) ? '' : ymd(dt);
}

// Devuelve una función (fecha) => boolean para el rango dado.
export function makeInRange({ from, to }) {
  if (!from && !to) return () => true;
  return (dateLike) => {
    const d = toYMD(dateLike);
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };
}
