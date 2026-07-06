import { useMemo, useState } from 'react';
import { money, phoneFmt } from '../format';
import { usePaged } from '../usePaged';
import Pager from './Pager';

// Valor de orden por columna (incluye las columnas calculadas).
const sortValue = {
  name: (c) => (c.name || '').toLowerCase(),
  credito_ofrecido: (c) => c.credito_ofrecido || 0,
  deuda_total: (c) => c.deuda_total || 0,
  deuda_vencida: (c) => c.deuda_vencida || 0,
  pv: (c) => (c.deuda_total > 0 ? c.deuda_vencida / c.deuda_total : 0),
  util: (c) => (c.credito_ofrecido > 0 ? c.deuda_total / c.credito_ofrecido : 0),
};
const TEXT_COLS = new Set(['name']);

/** Base de datos de clientes/deudores, con búsqueda, orden y paginación. */
export default function ClientesTable({ clientes }) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('deuda_vencida'); // por defecto: mayor deuda vencida
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(TEXT_COLS.has(key) ? 'asc' : 'desc'); // números arrancan mayor→menor
    }
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clientes;
    return clientes.filter((c) =>
      (c.name || '').toLowerCase().includes(t) ||
      (c.empresa || '').toLowerCase().includes(t) ||
      (c.email || '').toLowerCase().includes(t) ||
      String(c.phone || '').includes(t.replace(/\D/g, ''))
    );
  }, [clientes, q]);

  const sorted = useMemo(() => {
    const val = sortValue[sortKey];
    if (!val) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const { slice, start, pager } = usePaged(sorted, 25);

  const caret = (key) => (key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');
  const Th = ({ k, children, cls }) => (
    <th className={`${cls || ''} sortable ${k === sortKey ? 'sorted' : ''}`} onClick={() => toggleSort(k)} title="Ordenar">
      {children}<span className="caret">{caret(k)}</span>
    </th>
  );

  return (
    <div>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre, código, teléfono o email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Pager p={pager} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <Th k="name">Cliente</Th>
              <th>Teléfono</th>
              <Th k="credito_ofrecido" cls="num">Crédito</Th>
              <Th k="deuda_total" cls="num">Deuda total</Th>
              <Th k="deuda_vencida" cls="num">Vencida</Th>
              <Th k="pv" cls="num">% venc.</Th>
              <Th k="util" cls="num">Util.</Th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((c, i) => {
              const pv = c.deuda_total > 0 ? Math.round((c.deuda_vencida / c.deuda_total) * 100) : 0;
              const util = c.credito_ofrecido > 0 ? Math.round((c.deuda_total / c.credito_ofrecido) * 100) : 0;
              return (
                <tr key={c.phone + '-' + (c.codigo || i)}>
                  <td style={{ color: 'var(--text-muted)' }}>{start + i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{c.empresa}</div>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{phoneFmt(c.phone)}</td>
                  <td className="num">{money(c.credito_ofrecido)}</td>
                  <td className="num">{money(c.deuda_total)}</td>
                  <td className="num" style={{ color: c.deuda_vencida > 0 ? 'var(--critical)' : 'var(--text-muted)' }}>
                    {money(c.deuda_vencida)}
                  </td>
                  <td className="num" style={{ color: pv > 75 ? 'var(--critical)' : pv > 25 ? 'var(--serious)' : 'var(--text-secondary)' }}>{pv}%</td>
                  <td className="num" style={{ color: util > 90 ? 'var(--critical)' : 'var(--text-secondary)' }}>{util}%</td>
                  <td className="trunc" style={{ maxWidth: 200 }} title={c.email}>{c.email || '—'}</td>
                </tr>
              );
            })}
            {slice.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>Sin resultados para “{q}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
