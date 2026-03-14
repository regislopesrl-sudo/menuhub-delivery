'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/services/api';

export default function PurchasingDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.get('/purchasing/orders').then((items) => {
      const found = (items ?? []).find((item: any) => item.id === params.id);
      setOrder(found ?? null);
    });
  }, [params.id]);

  return (
    <PermissionGuard permission="purchasing.view">
      <div className="space-y-6">
        {!order ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Pedido de compra não encontrado.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">
                Compra {order.supplier?.name ?? '-'}
              </h1>
              <StatusBadge status={order.status} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-2 text-sm text-slate-600">
                <p>Total: R$ {Number(order.totalAmount ?? 0).toFixed(2)}</p>
                <p>
                  Previsão:{' '}
                  {order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toLocaleDateString('pt-BR')
                    : '-'}
                </p>
                <p>Observações: {order.notes ?? '-'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Itens</h2>
              <div className="mt-4 space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="text-sm text-slate-600">
                    {item.stockItem?.name ?? '-'} • {Number(item.quantity ?? 0).toFixed(3)} •
                    R$ {Number(item.totalCost ?? 0).toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
