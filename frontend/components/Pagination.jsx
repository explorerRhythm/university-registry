"use client";

export default function Pagination({ page, pages, total, limit, onPage }) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
      <p className="text-slate">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of{" "}
        <span className="font-medium text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button className="btn-ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <span className="px-1 tabular-nums text-slate">Page {page} of {pages}</span>
        <button className="btn-ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
