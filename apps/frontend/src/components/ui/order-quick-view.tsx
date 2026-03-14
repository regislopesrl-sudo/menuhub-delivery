'use client';

import { StatusBadge } from '@/components/ui/status-badge';

export function OrderQuickView({ order }: { order: any }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">Pedido</p>
        <h3 className="text-xl font-bold text-slate-900">#{order.orderNumber}</h3>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={order.status} />
        <span className="text-sm text-slate-500">{order.channel}</span>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Cliente</p>
        <p className="font-medium text-slate-900">{order.customer?.name ?? 'Sem cliente'}</p>
      </div>

      <div>
        <h4 className="font-semibold text-slate-900">Itens</h4>
        <div className="mt-3 space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="border-b border-slate-100 pb-3">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {Number(item.quantity)}x {item.productNameSnapshot}
                  </p>
                  {item.notes ? (
                    <p className="mt-1 text-xs text-slate-500">{item.notes}</p>
                  ) : null}
                </div>
                <p className="text-sm text-slate-700">
                  R$ {Number(item.totalPrice ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>R$ {Number(order.subtotal ?? 0).toFixed(2)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-slate-600">
          <span>Entrega</span>
          <span>R$ {Number(order.deliveryFee ?? 0).toFixed(2)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-semibold text-slate-900">
          <span>Total</span>
          <span>R$ {Number(order.totalAmount ?? 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
