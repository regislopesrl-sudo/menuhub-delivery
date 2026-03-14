'use client';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

export function Toast({ message, type = 'info' }: ToastProps) {
  const styles = {
    success: 'border-green-200 bg-green-50 text-green-700',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
