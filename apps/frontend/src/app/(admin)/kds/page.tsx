'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function KdsPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/kds/queue').then(setOrders).catch(() => setOrders([]));
  }, []);

  return (
    <PermissionGuard permission="kds.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KDS</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fila de producao da cozinha.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  Pedido #{order.orderNumber}
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="text-sm text-slate-700">
                    {Number(item.quantity)}x {item.productNameSnapshot}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}
