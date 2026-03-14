'use client';

const styles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_CONFIRMATION: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_PREPARATION: 'bg-orange-50 text-orange-700 border-orange-200',
  PREPARING: 'bg-orange-50 text-orange-700 border-orange-200',
  READY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OUT_FOR_DELIVERY: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  FINALIZED: 'bg-green-50 text-green-700 border-green-200',
  CANCELED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusBadge({ status }: { status?: string }) {
  const label = status ?? '-';
  const className =
    styles[label] ?? 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
