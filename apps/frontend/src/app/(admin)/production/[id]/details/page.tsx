'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/services/api';

export default function ProductionDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.get('/production/orders').then((items) => {
      const found = (items ?? []).find((item: any) => item.id === params.id);
      setOrder(found ?? null);
    });
  }, [params.id]);

  return (
    <PermissionGuard permission="production.view">
      <div className="space-y-6">
        {!order ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Ordem de produção não encontrada.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">
                {order.stockItem?.name ?? '-'}
              </h1>
              <StatusBadge status={order.status} />
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              <p>Planejado: {Number(order.plannedQuantity ?? 0).toFixed(3)}</p>
              <p>Real: {Number(order.actualQuantity ?? 0).toFixed(3)}</p>
              <p>Perda: {Number(order.lossQuantity ?? 0).toFixed(3)}</p>
              <p>
                Início:{' '}
                {order.startedAt ? new Date(order.startedAt).toLocaleString('pt-BR') : '-'}
              </p>
              <p>
                Fim:{' '}
                {order.finishedAt ? new Date(order.finishedAt).toLocaleString('pt-BR') : '-'}
              </p>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
