'use client';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
