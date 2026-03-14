'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { OrderPrintButton } from '@/components/orders/order-print-button';
import { OrderCancelForm } from '@/components/forms/order-cancel-form';
import { OrderPaymentForm } from '@/components/forms/order-payment-form';
import { OrderStatusForm } from '@/components/forms/order-status-form';
import { api } from '@/services/api';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get(`/orders/${params.id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (params.id) load();
  }, [params.id]);

  return (
    <PermissionGuard permission="orders.view">
      <div className="space-y-6">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Carregando pedido...
          </div>
        ) : !order ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Pedido nao encontrado.
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Pedido #{order.orderNumber}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {order.customer?.name ?? 'Sem cliente'} • {order.channel}
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm">{order.status}</div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Itens</h2>

                  <div className="mt-4 space-y-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="border-b border-slate-100 pb-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {Number(item.quantity)}x {item.productNameSnapshot}
                            </p>
                            {item.notes ? (
                              <p className="mt-1 text-sm text-slate-500">{item.notes}</p>
                            ) : null}
                          </div>

                          <div className="text-sm font-medium text-slate-700">
                            R$ {Number(item.totalPrice ?? 0).toFixed(2)}
                          </div>
                        </div>

                        {item.addons?.length ? (
                          <div className="mt-2 space-y-1">
                            {item.addons.map((addon: any) => (
                              <p key={addon.id} className="text-sm text-slate-500">
                                + {addon.nameSnapshot}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>

                  <div className="mt-4 space-y-3">
                    {order.statusLogs?.map((log: any) => (
                      <div key={log.id} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">{log.newStatus}</span>
                        {' • '}
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : '-'}
                        {log.notes ? ` • ${log.notes}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Resumo</h2>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R$ {Number(order.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desconto</span>
                      <span>R$ {Number(order.discountAmount ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrega</span>
                      <span>R$ {Number(order.deliveryFee ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 font-semibold text-slate-900">
                      <span>Total</span>
                      <span>R$ {Number(order.totalAmount ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-semibold text-slate-900">Pagamentos</h3>
                    <div className="mt-2 space-y-2">
                      {order.payments?.length ? (
                        order.payments.map((payment: any) => (
                          <div key={payment.id} className="text-sm text-slate-600">
                            {payment.paymentMethod} • R$ {Number(payment.amount ?? 0).toFixed(2)}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Sem pagamentos registrados.</p>
                      )}
                    </div>
                  </div>
                </div>

                <OrderPrintButton order={order} />
                <OrderStatusForm orderId={String(params.id)} onSuccess={load} />
                <OrderPaymentForm orderId={String(params.id)} onSuccess={load} />
                <OrderCancelForm orderId={String(params.id)} onSuccess={load} />
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
