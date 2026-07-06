import { num } from '../format';

const PAGE_SIZES = [25, 50, 100];

export default function Pager({ p }) {
  return (
    <div className="pager">
      <div className="pager-sizes">
        <span className="pager-lbl">Por página:</span>
        {PAGE_SIZES.map((s) => (
          <button key={s} className={`pager-size ${s === p.pageSize ? 'active' : ''}`} onClick={() => p.setPageSize(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="pager-nav">
        <span className="pager-lbl">{num(p.from)}–{num(p.to)} de {num(p.total)}</span>
        <button className="pager-btn" onClick={() => p.setPage(1)} disabled={p.page === 1}>«</button>
        <button className="pager-btn" onClick={() => p.setPage(p.page - 1)} disabled={p.page === 1}>‹</button>
        <span className="pager-page">{p.page} / {p.pages}</span>
        <button className="pager-btn" onClick={() => p.setPage(p.page + 1)} disabled={p.page === p.pages}>›</button>
        <button className="pager-btn" onClick={() => p.setPage(p.pages)} disabled={p.page === p.pages}>»</button>
      </div>
    </div>
  );
}
