'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/services/api';

export function OrderPaymentForm({
  orderId,
  onSuccess,
}: {
  orderId: string;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [amount, setAmount] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/orders/${orderId}/payments`, {
        payments: [
          {
            paymentMethod,
            amount: Number(amount),
            transactionReference: transactionReference || undefined,
          },
        ],
      });

      showToast('Pagamento registrado com sucesso', 'success');
      setAmount('');
      setTransactionReference('');
      onSuccess();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao registrar pagamento',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Registrar pagamento</h2>

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="pix">Pix</option>
        <option value="credit">Crédito</option>
        <option value="debit">Débito</option>
        <option value="cash">Dinheiro</option>
        <option value="gift_card">Gift card</option>
      </select>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Valor"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={transactionReference}
        onChange={(e) => setTransactionReference(e.target.value)}
        placeholder="Referência"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <button
        type="submit"
        disabled={loading || !amount}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Registrar pagamento'}
      </button>
    </form>
  );
}
