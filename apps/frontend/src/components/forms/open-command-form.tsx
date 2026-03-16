'use client';

'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';
import { CustomerAutocomplete } from '@/components/customers/customer-autocomplete';

export function OpenCommandForm({
  table,
  onSuccess,
}: {
  table: any;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    code: '',
    customerId: '',
    customerName: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/commands/open', {
        tableId: table.id,
        customerId: form.customerId || undefined,
        code: form.code,
      });

      showToast('Comanda aberta com sucesso', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao abrir comanda', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={form.code}
        onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
        placeholder="Código da comanda"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <CustomerAutocomplete
        value={form.customerName}
        onSelect={(customer) =>
          setForm((prev) => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.name,
          }))
        }
      />

      <button
        type="submit"
        disabled={loading || !form.code}
        className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium disabled:opacity-60"
      >
        {loading ? 'Abrindo...' : 'Abrir comanda'}
      </button>
    </form>
  );
}
