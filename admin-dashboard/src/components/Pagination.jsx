"use client";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const btnCls = "px-3 py-1.5 bg-card-alt-bg border border-card-border text-text-muted text-xs rounded-lg cursor-pointer hover:bg-brand-muted hover:text-brand hover:border-brand/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-card-border">
      <p className="text-xs text-text-muted m-0">
        Halaman {page} dari {totalPages}
      </p>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btnCls}>
          ← Prev
        </button>
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className={btnCls}>
          Next →
        </button>
      </div>
    </div>
  );
}
