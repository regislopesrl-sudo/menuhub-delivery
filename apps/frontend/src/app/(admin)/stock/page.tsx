'use client';

import { useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StockItemForm } from '@/components/forms/stock-item-form';
import { DataTable } from '@/components/ui/data-table';
import { ListFilters } from '@/components/ui/list-filters';
import { Modal } from '@/components/ui/modal';
import { RowActions } from '@/components/ui/row-actions';
import { api } from '@/services/api';

export default function StockPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  function load() {
    api
      .get('/stock/items')
      .then((response) => setRows(response.data ?? response))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      return (
        String(row.name ?? '').toLowerCase().includes(q) ||
        String(row.code ?? '').toLowerCase().includes(q) ||
        String(row.stockUnit ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  return (
    <PermissionGuard permission="stock.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
            <p className="mt-1 text-sm text-slate-500">
              Controle de itens, saldos e custos.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo item
          </button>
        </div>

        <ListFilters search={search} onSearchChange={setSearch} />

        <DataTable
          data={filteredRows}
          columns={[
            { key: 'name', title: 'Item' },
            { key: 'stockUnit', title: 'Unidade' },
            {
              key: 'currentQuantity',
              title: 'Saldo atual',
              render: (row) => Number(row.currentQuantity ?? 0).toFixed(3),
            },
            {
              key: 'minimumQuantity',
              title: 'Mínimo',
              render: (row) => Number(row.minimumQuantity ?? 0).toFixed(3),
            },
            {
              key: 'averageCost',
              title: 'Custo médio',
              render: (row) => `R$ ${Number(row.averageCost ?? 0).toFixed(2)}`,
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <RowActions
                  detailHref={`/stock/${row.id}/details`}
                  editHref={`/stock/${row.id}`}
                />
              ),
            },
          ]}
        />

        <Modal open={open} title="Novo item de estoque" onClose={() => setOpen(false)}>
          <StockItemForm
            onSuccess={() => {
              setOpen(false);
              load();
            }}
          />
        </Modal>
      </div>
    </PermissionGuard>
  );
}
