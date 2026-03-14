'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

type OrderStatusFormProps = {
  orderId: string;
  onSuccess: () => void;
};

const statuses = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'IN_PREPARATION',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FINALIZED',
  'CANCELED',
];

export function OrderStatusForm({ orderId, onSuccess }: OrderStatusFormProps) {
  const { showToast } = useToast();
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/orders/${orderId}/status`, { status, notes });
      showToast('Status atualizado com sucesso', 'success');
      setStatus('');
      setNotes('');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar status', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Alterar status</h2>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
      >
        <option value="">Selecione um status</option>
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observação"
        className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
      />

      <button
        type="submit"
        disabled={loading || !status}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Atualizar status'}
      </button>
    </form>
  );
}
