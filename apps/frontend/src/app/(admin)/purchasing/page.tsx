'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PurchasingActions } from '@/components/purchasing/purchasing-actions';
import { DataTable } from '@/components/ui/data-table';
import { RowActions } from '@/components/ui/row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/services/api';

export default function PurchasingPage() {
  const [data, setData] = useState<any[]>([]);

  function load() {
    api
      .get('/purchasing/orders')
      .then((response) => setData(response.data ?? response))
      .catch(() => setData([]));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <PermissionGuard permission="purchasing.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Compras</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pedidos de compra e recebimentos.
            </p>
          </div>

          <Link
            href="/purchasing/new"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo pedido de compra
          </Link>
        </div>

        <DataTable
          data={data}
          columns={[
            {
              key: 'supplier',
              title: 'Fornecedor',
              render: (row) => row.supplier?.name ?? '-',
            },
            {
              key: 'status',
              title: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'totalAmount',
              title: 'Total',
              render: (row) => `R$ ${Number(row.totalAmount ?? 0).toFixed(2)}`,
            },
            {
              key: 'expectedDeliveryDate',
              title: 'Previsão',
              render: (row) =>
                row.expectedDeliveryDate
                  ? new Date(row.expectedDeliveryDate).toLocaleDateString('pt-BR')
                  : '-',
            },
            {
              key: 'quickActions',
              title: 'Ações rápidas',
              render: (row) => <PurchasingActions order={row} onSuccess={load} />,
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <RowActions
                  detailHref={`/purchasing/${row.id}/details`}
                  editHref={`/purchasing/${row.id}`}
                />
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
}
