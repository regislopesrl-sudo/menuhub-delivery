'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DataTable } from '@/components/ui/data-table';
import { RowActions } from '@/components/ui/row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/services/api';

export default function DeliveryPage() {
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/couriers').then(setCouriers).catch(() => setCouriers([]));
  }, []);

  return (
    <PermissionGuard permission="delivery.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Delivery</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestão de entregadores e despacho.
            </p>
          </div>

          <Link
            href="/delivery/new"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo entregador
          </Link>
        </div>

        <DataTable
          data={couriers}
          columns={[
            { key: 'name', title: 'Nome' },
            { key: 'phone', title: 'Telefone' },
            { key: 'vehicleType', title: 'Veículo' },
            {
              key: 'status',
              title: 'Status',
              render: (row) => (
                <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
              ),
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => <RowActions editHref={`/delivery/${row.id}`} />,
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
}
