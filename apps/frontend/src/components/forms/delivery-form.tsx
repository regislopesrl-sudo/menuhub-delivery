'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function DeliveryForm({ initialData }: { initialData?: any }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    phone: initialData?.phone ?? '',
    vehicleType: initialData?.vehicleType ?? '',
    vehiclePlate: initialData?.vehiclePlate ?? '',
    document: initialData?.document ?? '',
    commissionType: initialData?.commissionType ?? '',
    commissionValue: initialData?.commissionValue
      ? String(initialData.commissionValue)
      : '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone || undefined,
        vehicleType: form.vehicleType || undefined,
        vehiclePlate: form.vehiclePlate || undefined,
        document: form.document || undefined,
        commissionType: form.commissionType || undefined,
        commissionValue: form.commissionValue ? Number(form.commissionValue) : undefined,
      };

      if (initialData?.id) {
        await api.patch(`/couriers/${initialData.id}`, payload);
        showToast('Entregador atualizado com sucesso', 'success');
      } else {
        await api.post('/couriers', payload);
        showToast('Entregador criado com sucesso', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar entregador', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <input
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Nome"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={form.phone}
        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
        placeholder="Telefone"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={form.vehicleType}
        onChange={(e) => setForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
        placeholder="Veículo"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={form.vehiclePlate}
        onChange={(e) => setForm((prev) => ({ ...prev, vehiclePlate: e.target.value }))}
        placeholder="Placa"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={form.document}
        onChange={(e) => setForm((prev) => ({ ...prev, document: e.target.value }))}
        placeholder="Documento"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={form.commissionType}
        onChange={(e) => setForm((prev) => ({ ...prev, commissionType: e.target.value }))}
        placeholder="Tipo de comissão"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        type="number"
        value={form.commissionValue}
        onChange={(e) => setForm((prev) => ({ ...prev, commissionValue: e.target.value }))}
        placeholder="Valor da comissão"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {loading ? 'Salvando...' : 'Salvar entregador'}
      </button>
    </form>
  );
}
