'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function ProductionForm({
  initialData,
  stockItems,
}: {
  initialData?: any;
  stockItems: any[];
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    stockItemId: initialData?.stockItemId ?? '',
    plannedQuantity: initialData?.plannedQuantity
      ? String(initialData.plannedQuantity)
      : '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        stockItemId: form.stockItemId,
        plannedQuantity: Number(form.plannedQuantity),
      };

      if (initialData?.id) {
        showToast(
          'Fluxo de edição do backend de produção pode ser expandido na próxima etapa',
          'info',
        );
      } else {
        await api.post('/production/orders', payload);
        showToast('Ordem de produção criada com sucesso', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar produção', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <select
        value={form.stockItemId}
        onChange={(e) => setForm((prev) => ({ ...prev, stockItemId: e.target.value }))}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="">Selecione o item</option>
        {stockItems.map((stockItem) => (
          <option key={stockItem.id} value={stockItem.id}>
            {stockItem.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Quantidade planejada"
        value={form.plannedQuantity}
        onChange={(e) => setForm((prev) => ({ ...prev, plannedQuantity: e.target.value }))}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {loading ? 'Salvando...' : 'Salvar produção'}
      </button>
    </form>
  );
}
