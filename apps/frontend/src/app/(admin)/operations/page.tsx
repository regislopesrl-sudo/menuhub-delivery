'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { KpiCard } from '@/components/ui/kpi-card';

export default function OperationsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api
      .get('/reports/operations-dashboard')
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <PermissionGuard permission="reports.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operação cozinha/balcão</h1>
          <p className="text-sm text-slate-500 mt-1">Monitoramento rápido da operação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard title="Fila cozinha" value={data?.kitchenQueue ?? 0} />
          <KpiCard title="Fila balcão" value={data?.counterQueue ?? 0} />
          <KpiCard title="Pedidos prontos" value={data?.readyOrders ?? 0} />
          <KpiCard title="Pedidos atrasados" value={data?.delayedOrders ?? 0} />
        </div>
      </div>
    </PermissionGuard>
  );
}
