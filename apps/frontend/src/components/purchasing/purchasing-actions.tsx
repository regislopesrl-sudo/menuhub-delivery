'use client';

import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function PurchasingActions({
  order,
  onSuccess,
}: {
  order: any;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();

  async function approve() {
    try {
      await api.patch(`/purchasing/orders/${order.id}/approve`);
      showToast('Pedido de compra aprovado', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao aprovar compra', 'error');
    }
  }

  return (
    <div className="flex items-center gap-2">
      {order.status === 'draft' ? (
        <button
          onClick={approve}
          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700"
        >
          Aprovar
        </button>
      ) : null}
    </div>
  );
}
