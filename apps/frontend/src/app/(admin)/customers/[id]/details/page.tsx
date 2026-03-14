'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function CustomerDetailsPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      api.get(`/customers/${params.id}`).then(setCustomer).catch(() => setCustomer(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="customers.view">
      <div className="space-y-6">
        {!customer ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Cliente não encontrado.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {customer.phone ?? '-'} • {customer.email ?? '-'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Dados</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>WhatsApp: {customer.whatsapp ?? '-'}</p>
                  <p>VIP: {customer.isVip ? 'Sim' : 'Não'}</p>
                  <p>Bloqueado: {customer.isBlocked ? 'Sim' : 'Não'}</p>
                  <p>Observações: {customer.notes ?? '-'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Endereços</h2>
                <div className="mt-4 space-y-3">
                  {customer.addresses?.length ? (
                    customer.addresses.map((address: any) => (
                      <div key={address.id} className="text-sm text-slate-600">
                        {address.street}, {address.number} - {address.district}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sem endereços cadastrados.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Pedidos</h2>

              <div className="mt-4 space-y-3">
                {customer.orders?.length ? (
                  customer.orders.map((order: any) => (
                    <div key={order.id} className="text-sm text-slate-600">
                      #{order.orderNumber} • {order.status} • R$ {Number(order.totalAmount ?? 0).toFixed(2)}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sem pedidos.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
