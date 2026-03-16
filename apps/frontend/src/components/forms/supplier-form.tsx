'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast-provider';

type SupplierFormProps = {
  initialData?: {
    id?: string;
    name?: string;
    document?: string;
    phone?: string;
    email?: string;
    notes?: string;
  } | null;
  onSuccess?: () => void;
};

export function SupplierForm({ initialData, onSuccess }: SupplierFormProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    document: initialData?.document ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    notes: initialData?.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        document: form.document || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        notes: form.notes || undefined,
      };

      if (initialData?.id) {
        await api.patch(`/suppliers/${initialData.id}`, payload);
        showToast('Fornecedor atualizado', 'success');
      } else {
        await api.post('/suppliers', payload);
        showToast('Fornecedor criado', 'success');
      }

      onSuccess?.();
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar fornecedor', 'error');
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
        label="Documento"
        value={form.document}
        onChange={(value) => setForm((prev) => ({ ...prev, document: value }))}
      />
      <TextInput
        label="Telefone"
        value={form.phone}
        onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
      />
      <TextInput
        label="E-mail"
        value={form.email}
        onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
        type="email"
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Observações</label>
        <textarea
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-70"
      >
        {loading ? 'Salvando...' : initialData?.id ? 'Atualizar' : 'Salvar'}
      </button>
    </form>
  );
}
