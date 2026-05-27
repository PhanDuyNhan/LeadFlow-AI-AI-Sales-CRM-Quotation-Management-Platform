export default function Pagination({ page, totalPages, total, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return (
      <div className="text-xs text-slate-500">
        {total ? `${total} total` : null}
      </div>
    );
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-xs text-slate-500">
        Page {page} of {totalPages} {total ? `• ${total} total` : ''}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => canPrev && onPageChange(page - 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => canNext && onPageChange(page + 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
