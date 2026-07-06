export const money = (n) =>
  '$' + Math.round(n || 0).toLocaleString('es-MX');

export const moneyShort = (n) => {
  const v = Math.abs(n || 0);
  if (v >= 1000) return '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return '$' + Math.round(n || 0).toLocaleString('es-MX');
};

export const pct = (n) => (n ?? 0).toFixed(n % 1 === 0 ? 0 : 1) + '%';

export const num = (n) => (n || 0).toLocaleString('es-MX');

// Teléfono de 10 dígitos -> (809) 242-2644
export const phoneFmt = (p) => {
  const d = String(p || '').replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p || '—';
};
