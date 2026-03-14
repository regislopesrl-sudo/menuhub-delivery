'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/services/api';

export default function DeliveryDetailsPage() {
  const params = useParams();
  const [courier, setCourier] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    api.get('/couriers').then((items) => {
      const list = items?.data ?? items ?? [];
      const found = list.find((item: any) => item.id === params.id);
      setCourier(found ?? null);
    });

    api
      .get(`/couriers/${params.id}/deliveries`)
      .then((response) => setDeliveries(response.data ?? response ?? []))
      .catch(() => setDeliveries([]));
  }, [params.id]);

  return (
    <PermissionGuard permission="delivery.view">
      <div className="space-y-6">
        {!courier ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Entregador não encontrado.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{courier.name}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {courier.phone ?? '-'} • {courier.vehicleType ?? '-'}
                </p>
              </div>
              <StatusBadge status={courier.isActive ? 'active' : 'inactive'} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Dados</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Placa: {courier.vehiclePlate ?? '-'}</p>
                <p>Documento: {courier.document ?? '-'}</p>
                <p>
                  Comissão: {courier.commissionType ?? '-'}{' '}
                  {courier.commissionValue
                    ? `• R$ ${Number(courier.commissionValue).toFixed(2)}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Histórico de entregas
              </h2>

              <div className="mt-4 space-y-3">
                {deliveries.length ? (
                  deliveries.map((delivery: any) => (
                    <div
                      key={delivery.id}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            Pedido #{delivery.order?.orderNumber ?? '-'}
                          </p>
                          <p className="text-sm text-slate-500">
                            {delivery.order?.customer?.name ?? 'Sem cliente'}
                          </p>
                        </div>
                        <StatusBadge
                          status={
                            delivery.deliveredAt
                              ? 'DELIVERED'
                              : delivery.failedAt
                                ? 'CANCELED'
                                : 'OUT_FOR_DELIVERY'
                          }
                        />
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        <p>
                          Atribuído:{' '}
                          {delivery.assignedAt
                            ? new Date(delivery.assignedAt).toLocaleString('pt-BR')
                            : '-'}
                        </p>
                        <p>
                          Saiu:{' '}
                          {delivery.outForDeliveryAt
                            ? new Date(delivery.outForDeliveryAt).toLocaleString('pt-BR')
                            : '-'}
                        </p>
                        <p>
                          Entregue:{' '}
                          {delivery.deliveredAt
                            ? new Date(delivery.deliveredAt).toLocaleString('pt-BR')
                            : '-'}
                        </p>
                        <p>Falha: {delivery.failedReason ?? '-'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Sem entregas registradas.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
