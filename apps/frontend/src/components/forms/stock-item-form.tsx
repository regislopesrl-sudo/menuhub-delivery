'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast-provider';

type StockItemFormData = {
  id?: string;
  name?: string;
  stockUnit?: string | null;
  minimumQuantity?: number | string | null;
  averageCost?: number | string | null;
};

export function StockItemForm({
  onSuccess,
  initialData,
}: {
  onSuccess?: () => void;
  initialData?: StockItemFormData | null;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    stockUnit: initialData?.stockUnit ?? '',
    minimumQuantity:
      initialData?.minimumQuantity === null || initialData?.minimumQuantity === undefined
        ? ''
        : String(initialData.minimumQuantity),
    averageCost:
      initialData?.averageCost === null || initialData?.averageCost === undefined
        ? ''
        : String(initialData.averageCost),
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        stockUnit: form.stockUnit,
        minimumQuantity: Number(form.minimumQuantity || 0),
        averageCost: Number(form.averageCost || 0),
      };

      if (initialData?.id) {
        await api.patch(`/stock/items/${initialData.id}`, payload);
        showToast('Item de estoque atualizado com sucesso', 'success');
      } else {
        await api.post('/stock/items', payload);
        showToast('Item de estoque criado com sucesso', 'success');
      }

      onSuccess?.();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao salvar item de estoque',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="Nome"
        value={form.name}
        onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
      />
      <TextInput
        label="Unidade"
        value={form.stockUnit}
        onChange={(value) => setForm((prev) => ({ ...prev, stockUnit: value }))}
      />
      <TextInput
        label="Quantidade mínima"
        type="number"
        value={form.minimumQuantity}
        onChange={(value) => setForm((prev) => ({ ...prev, minimumQuantity: value }))}
      />
      <TextInput
        label="Custo médio"
        type="number"
        value={form.averageCost}
        onChange={(value) => setForm((prev) => ({ ...prev, averageCost: value }))}
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
