function pageList(current, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const set = new Set([1, pages, current - 1, current, current + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);

  const out = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push('ellipsis');
    out.push(n);
    prev = n;
  }
  return out;
}

export default function Pagination({ page, pages, onPage }) {
  if (!pages || pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 rounded-full border border-ink/15 text-sm text-ink/70 hover:border-gold-3 hover:text-ink disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        &#8592; Prev
      </button>

      {pageList(page, pages).map((entry, i) =>
        entry === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-ink/40 text-sm">&#8230;</span>
        ) : (
          <button
            key={entry}
            type="button"
            aria-label={`Go to page ${entry}`}
            aria-current={entry === page ? 'page' : undefined}
            onClick={() => onPage(entry)}
            className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
              entry === page
                ? 'bg-gold text-ink shadow-lux'
                : 'text-ink/70 border border-ink/15 hover:border-gold-3'
            }`}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        className="px-4 py-2 rounded-full border border-ink/15 text-sm text-ink/70 hover:border-gold-3 hover:text-ink disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        Next &#8594;
      </button>
    </nav>
  );
}