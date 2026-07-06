import { useEffect, useMemo, useState } from 'react';

/** Paginación reutilizable. Devuelve el slice actual + props para <Pager>. */
export function usePaged(rows, initial = 25) {
  const [pageSize, setPageSize] = useState(initial);
  const [page, setPage] = useState(1);

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => { setPage(1); }, [pageSize, total]);
  const current = Math.min(page, pages);
  const start = (current - 1) * pageSize;

  const slice = useMemo(() => rows.slice(start, start + pageSize), [rows, start, pageSize]);

  return {
    slice,
    start,
    pager: {
      page: current, pages, pageSize, setPageSize, setPage, total,
      from: total ? start + 1 : 0,
      to: Math.min(start + pageSize, total),
    },
  };
}
