'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function DeliveryAreaForm({
  initialData,
  onSuccess,
}: {
  initialData?: any;
  onSuccess?: () => void;
}) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    zipCodeStart: initialData?.zipCodeStart ?? '',
    zipCodeEnd: initialData?.zipCodeEnd ?? '',
    deliveryFee: initialData?.deliveryFee ? String(initialData.deliveryFee) : '',
    estimatedMinutes: initialData?.estimatedMinutes ? String(initialData.estimatedMinutes) : '',
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        zipCodeStart: form.zipCodeStart,
        zipCodeEnd: form.zipCodeEnd,
        deliveryFee: Number(form.deliveryFee),
        estimatedMinutes: Number(form.estimatedMinutes),
        isActive: form.isActive,
      };

      if (initialData?.id) {
        await api.patch(`/delivery-areas/${initialData.id}`, payload);
        showToast('Área de entrega atualizada', 'success');
      } else {
        await api.post('/delivery-areas', payload);
        showToast('Área de entrega criada', 'success');
      }

      onSuccess?.();
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar área de entrega', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Nome da área"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={form.zipCodeStart}
          onChange={(e) => setForm((prev) => ({ ...prev, zipCodeStart: e.target.value }))}
          placeholder="CEP inicial"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          value={form.zipCodeEnd}
          onChange={(e) => setForm((prev) => ({ ...prev, zipCodeEnd: e.target.value }))}
          placeholder="CEP final"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          value={form.deliveryFee}
          onChange={(e) => setForm((prev) => ({ ...prev, deliveryFee: e.target.value }))}
          placeholder="Taxa"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
        <input
          type="number"
          value={form.estimatedMinutes}
          onChange={(e) => setForm((prev) => ({ ...prev, estimatedMinutes: e.target.value }))}
          placeholder="Prazo em minutos"
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
        />
        Área ativa
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium"
      >
        {loading ? 'Salvando...' : 'Salvar área'}
      </button>
    </form>
  );
}
