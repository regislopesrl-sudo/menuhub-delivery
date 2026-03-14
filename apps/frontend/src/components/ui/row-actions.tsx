'use client';

import Link from 'next/link';

type RowActionsProps = {
  detailHref?: string;
  editHref?: string;
  onDelete?: () => void;
};

export function RowActions({ detailHref, editHref, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {detailHref ? (
        <Link
          href={detailHref}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        >
          Detalhes
        </Link>
      ) : null}

      {editHref ? (
        <Link
          href={editHref}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        >
          Editar
        </Link>
      ) : null}

      {onDelete ? (
        <button
          onClick={onDelete}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
        >
          Excluir
        </button>
      ) : null}
    </div>
  );
}
