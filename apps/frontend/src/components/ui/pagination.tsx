'use client';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-slate-500">
        Página {page} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          Anterior
        </button>

        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
