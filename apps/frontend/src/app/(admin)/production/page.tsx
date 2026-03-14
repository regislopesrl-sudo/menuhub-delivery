'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DataTable } from '@/components/ui/data-table';
import { RowActions } from '@/components/ui/row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProductionActions } from '@/components/production/production-actions';
import { api } from '@/services/api';

export default function ProductionPage() {
  const [data, setData] = useState<any[]>([]);

  function load() {
    api
      .get('/production/orders')
      .then((response) => setData(response.data ?? response))
      .catch(() => setData([]));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PermissionGuard permission="production.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Produção</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ordens de produção e semiacabados.
            </p>
          </div>

          <Link
            href="/production/new"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Nova ordem
          </Link>
        </div>

        <DataTable
          data={data}
          columns={[
            {
              key: 'stockItem',
              title: 'Item',
              render: (row) => row.stockItem?.name ?? '-',
            },
            {
              key: 'status',
              title: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'plannedQuantity',
              title: 'Planejado',
              render: (row) => Number(row.plannedQuantity ?? 0).toFixed(3),
            },
            {
              key: 'actualQuantity',
              title: 'Real',
              render: (row) => Number(row.actualQuantity ?? 0).toFixed(3),
            },
            {
              key: 'quickActions',
              title: 'Ações rápidas',
              render: (row) => <ProductionActions order={row} onSuccess={load} />,
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <RowActions
                  detailHref={`/production/${row.id}/details`}
                  editHref={`/production/${row.id}`}
                />
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
}
