'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DataTable } from '@/components/ui/data-table';
import { ListFilters } from '@/components/ui/list-filters';
import { StatusBadge } from '@/components/ui/status-badge';

export default function CommandsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/commands').then(setRows).catch(() => setRows([]));
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((row) => {
      return (
        String(row.code ?? '').toLowerCase().includes(q) ||
        String(row.customer?.name ?? '').toLowerCase().includes(q) ||
        String(row.table?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  return (
    <PermissionGuard permission="orders.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comandas abertas</h1>
          <p className="text-sm text-slate-500 mt-1">Controle de comandas em aberto.</p>
        </div>

        <ListFilters search={search} onSearchChange={setSearch} />

        <DataTable
          data={filteredRows}
          columns={[
            { key: 'code', title: 'Comanda' },
            {
              key: 'table',
              title: 'Mesa',
              render: (row) => row.table?.name ?? '-',
            },
            {
              key: 'customer',
              title: 'Cliente',
              render: (row) => row.customer?.name ?? '-',
            },
            {
              key: 'status',
              title: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'orderCount',
              title: 'Pedidos',
            },
            {
              key: 'totalAmount',
              title: 'Total',
              render: (row) => `R$ ${Number(row.totalAmount ?? 0).toFixed(2)}`,
            },
            {
              key: 'openedAt',
              title: 'Abertura',
              render: (row) =>
                row.openedAt ? new Date(row.openedAt).toLocaleString('pt-BR') : '-',
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <Link
                  href={`/commands/${row.id}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Abrir
                </Link>
              ),
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
}
