'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

type ReceiptItem = {
  stockItemId: string;
  receivedQuantity: string;
  unitCost: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
};

export function PurchasingReceiptForm({
  suppliers,
  stockItems,
  purchaseOrders,
}: {
  suppliers: any[];
  stockItems: any[];
  purchaseOrders: any[];
}) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    purchaseOrderId: '',
    supplierId: '',
    invoiceNumber: '',
    invoiceKey: '',
  });

  const [items, setItems] = useState<ReceiptItem[]>([
    {
      stockItemId: '',
      receivedQuantity: '',
      unitCost: '',
      batchNumber: '',
      manufactureDate: '',
      expiryDate: '',
    },
  ]);

  const [loading, setLoading] = useState(false);

  function updateItem(index: number, field: keyof ReceiptItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        stockItemId: '',
        receivedQuantity: '',
        unitCost: '',
        batchNumber: '',
        manufactureDate: '',
        expiryDate: '',
      },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const receipt = await api.post('/purchasing/receipts', {
        purchaseOrderId: form.purchaseOrderId || undefined,
        supplierId: form.supplierId,
        invoiceNumber: form.invoiceNumber || undefined,
        invoiceKey: form.invoiceKey || undefined,
        items: items
          .filter((item) => item.stockItemId && item.receivedQuantity && item.unitCost)
          .map((item) => ({
            stockItemId: item.stockItemId,
            receivedQuantity: Number(item.receivedQuantity),
            unitCost: Number(item.unitCost),
          })),
      });

      for (const item of items) {
        if (!item.stockItemId || !item.receivedQuantity || !item.unitCost) continue;

        if (item.batchNumber || item.expiryDate || item.manufactureDate) {
          await api.post('/stock/batches', {
            stockItemId: item.stockItemId,
            supplierId: form.supplierId,
            batchNumber: item.batchNumber || undefined,
            manufactureDate: item.manufactureDate || undefined,
            expiryDate: item.expiryDate || undefined,
            initialQuantity: Number(item.receivedQuantity),
            unitCost: Number(item.unitCost),
            receivedDate: new Date().toISOString(),
          });
        }
      }

      showToast('Recebimento criado com lotes/validade', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar recebimento', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
    >
      <select
        value={form.purchaseOrderId}
        onChange={(e) => setForm((prev) => ({ ...prev, purchaseOrderId: e.target.value }))}
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      >
        <option value="">Pedido de compra opcional</option>
        {purchaseOrders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.supplier?.name ?? '-'} - R$ {Number(order.totalAmount ?? 0).toFixed(2)}
          </option>
        ))}
      </select>

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
        value={form.invoiceNumber}
        onChange={(e) => setForm((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
        placeholder="Número da nota"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <input
        value={form.invoiceKey}
        onChange={(e) => setForm((prev) => ({ ...prev, invoiceKey: e.target.value }))}
        placeholder="Chave da nota"
        className="w-full rounded-xl border border-slate-300 px-4 py-3"
      />

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                placeholder="Quantidade recebida"
                value={item.receivedQuantity}
                onChange={(e) => updateItem(index, 'receivedQuantity', e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={item.batchNumber}
                onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                placeholder="Número do lote"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                type="date"
                value={item.manufactureDate}
                onChange={(e) => updateItem(index, 'manufactureDate', e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                type="date"
                value={item.expiryDate}
                onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
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
        className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-medium"
      >
        {loading ? 'Salvando...' : 'Salvar recebimento'}
      </button>
    </form>
  );
}
