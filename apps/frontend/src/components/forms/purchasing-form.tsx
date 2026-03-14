'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

type ItemRow = {
  stockItemId: string;
  quantity: string;
  unitCost: string;
};

export function PurchasingForm({
  initialData,
  suppliers,
  stockItems,
}: {
  initialData?: any;
  suppliers: any[];
  stockItems: any[];
}) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    supplierId: initialData?.supplierId ?? '',
    expectedDeliveryDate: initialData?.expectedDeliveryDate
      ? String(initialData.expectedDeliveryDate).slice(0, 10)
      : '',
    notes: initialData?.notes ?? '',
  });

  const [items, setItems] = useState<ItemRow[]>(
    initialData?.items?.length
      ? initialData.items.map((item: any) => ({
          stockItemId: item.stockItemId,
          quantity: String(item.quantity ?? ''),
          unitCost: String(item.unitCost ?? ''),
        }))
      : [{ stockItemId: '', quantity: '', unitCost: '' }],
  );

  const [loading, setLoading] = useState(false);

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { stockItemId: '', quantity: '', unitCost: '' }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        supplierId: form.supplierId,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        notes: form.notes || undefined,
        items: items
          .filter((item) => item.stockItemId && item.quantity && item.unitCost)
          .map((item) => ({
            stockItemId: item.stockItemId,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost),
          })),
      };

      if (initialData?.id) {
        showToast(
          'Fluxo de edição do backend de compras pode ser expandido na próxima etapa',
          'info',
        );
      } else {
        await api.post('/purchasing/orders', payload);
        showToast('Pedido de compra criado com sucesso', 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar compra', 'error');
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
        value={form.supplierId}
        onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="">Selecione o fornecedor</option>
        {suppliers.map((supplier) => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={form.expectedDeliveryDate}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, expectedDeliveryDate: e.target.value }))
        }
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <textarea
        value={form.notes}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        placeholder="Observações"
        className="min-h-[110px] w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={item.stockItemId}
              onChange={(e) => updateItem(index, 'stockItemId', e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
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
              placeholder="Quantidade"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              placeholder="Custo unitário"
              value={item.unitCost}
              onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
      >
        Adicionar item
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {loading ? 'Salvando...' : 'Salvar compra'}
      </button>
    </form>
  );
}
