'use client';

import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function ReceiptActions({
  receiptId,
  onSuccess,
}: {
  receiptId: string;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();

  async function finalizeReceipt() {
    try {
      await api.post(`/purchasing/receipts/${receiptId}/finalize`);
      showToast('Recebimento finalizado', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao finalizar recebimento', 'error');
    }
  }

  return (
    <button
      onClick={finalizeReceipt}
      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700"
    >
      Finalizar recebimento
    </button>
  );
}
