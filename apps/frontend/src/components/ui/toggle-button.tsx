'use client';

type ToggleButtonProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  onClick: () => void;
  loading?: boolean;
};

export function ToggleButton({
  active,
  activeLabel = 'Ativo',
  inactiveLabel = 'Inativo',
  onClick,
  loading = false,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${
        active
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-slate-300 bg-white text-slate-700'
      }`}
    >
      {loading ? 'Salvando...' : active ? activeLabel : inactiveLabel}
    </button>
  );
}
