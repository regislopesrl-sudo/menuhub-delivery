'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/services/api';

export function OrderCancelForm({
  orderId,
  onSuccess,
}: {
  orderId: string;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/orders/${orderId}/cancel`, { reason });
      showToast('Pedido cancelado com sucesso', 'success');
      setReason('');
      onSuccess();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao cancelar pedido',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-red-700">Cancelar pedido</h2>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo do cancelamento"
        className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
      />

      <button
        type="submit"
        disabled={loading || !reason.trim()}
        className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Cancelando...' : 'Cancelar pedido'}
      </button>
    </form>
  );
}
