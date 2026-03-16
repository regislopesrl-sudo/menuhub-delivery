'use client';

import { useMemo, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

type PaymentRow = {
  paymentMethod: string;
  amount: string;
  transactionReference: string;
};

export function CommandCloseForm({
  command,
  onSuccess,
}: {
  command: any;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();

  const baseTotal = useMemo(() => {
    return (command?.orders ?? []).reduce(
      (acc: number, order: any) => acc + Number(order.totalAmount ?? 0),
      0,
    );
  }, [command]);

  const [discountAmount, setDiscountAmount] = useState('0');
  const [extraFee, setExtraFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [payments, setPayments] = useState<PaymentRow[]>([
    {
      paymentMethod: 'pix',
      amount: String(baseTotal),
      transactionReference: '',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const finalTotal = useMemo(() => {
    return baseTotal - Number(discountAmount || 0) + Number(extraFee || 0);
  }, [baseTotal, discountAmount, extraFee]);

  function updatePayment(index: number, field: keyof PaymentRow, value: string) {
    setPayments((prev) =>
      prev.map((payment, i) =>
        i === index ? { ...payment, [field]: value } : payment,
      ),
    );
  }

  function addPayment() {
    setPayments((prev) => [
      ...prev,
      {
        paymentMethod: 'pix',
        amount: '',
        transactionReference: '',
      },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch(`/commands/${command.id}/close`, {
        discountAmount: Number(discountAmount || 0),
        extraFee: Number(extraFee || 0),
        notes: notes || undefined,
        payments: payments.map((payment) => ({
          paymentMethod: payment.paymentMethod,
          amount: Number(payment.amount),
          transactionReference: payment.transactionReference || undefined,
        })),
      });

      showToast('Comanda fechada com sucesso', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao fechar comanda', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4"
    >
      <h2 className="text-lg font-semibold text-slate-900">Fechar comanda</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          value={discountAmount}
          onChange={(e) => setDiscountAmount(e.target.value)}
          placeholder="Desconto"
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="number"
          value={extraFee}
          onChange={(e) => setExtraFee(e.target.value)}
          placeholder="Taxa extra"
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Total base</span>
          <span>R$ {baseTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Total final</span>
          <span>R$ {finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {payments.map((payment, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={payment.paymentMethod}
              onChange={(e) => updatePayment(index, 'paymentMethod', e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="pix">Pix</option>
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
              <option value="cash">Dinheiro</option>
            </select>

            <input
              type="number"
              value={payment.amount}
              onChange={(e) => updatePayment(index, 'amount', e.target.value)}
              placeholder="Valor"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={payment.transactionReference}
              onChange={(e) =>
                updatePayment(index, 'transactionReference', e.target.value)
              }
              placeholder="Referência"
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addPayment}
        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
      >
        Adicionar pagamento
      </button>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observações"
        className="w-full min-h-[110px] rounded-xl border border-slate-300 px-4 py-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-red-600 text-white px-4 py-3 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Fechando...' : 'Fechar comanda'}
      </button>
    </form>
  );
}
