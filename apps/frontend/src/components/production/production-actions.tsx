'use client';

import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/services/api';

export function ProductionActions({
  order,
  onSuccess,
}: {
  order: any;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();

  async function start() {
    try {
      await api.post(`/production/orders/${order.id}/start`);
      showToast('Produção iniciada', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao iniciar produção', 'error');
    }
  }

  async function finish() {
    try {
      await api.post(`/production/orders/${order.id}/finish`);
      showToast('Produção finalizada', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao finalizar produção', 'error');
    }
  }

  return (
    <div className="flex items-center gap-2">
      {order.status === 'planned' ? (
        <button
          onClick={start}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700"
        >
          Iniciar
        </button>
      ) : null}

      {order.status === 'in_progress' ? (
        <button
          onClick={finish}
          className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700"
        >
          Finalizar
        </button>
      ) : null}
    </div>
  );
}
