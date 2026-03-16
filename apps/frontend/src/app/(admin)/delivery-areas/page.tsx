'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { ListFilters } from '@/components/ui/list-filters';
import { RowActions } from '@/components/ui/row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { DeliveryAreaForm } from '@/components/forms/delivery-area-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function DeliveryAreasPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  function load() {
    api
      .get('/delivery-areas')
      .then((response) => setRows(response.data ?? response))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return rows.filter((item) => (item.name ?? '').toLowerCase().includes(query));
  }, [rows, search]);

  return (
    <PermissionGuard permission="delivery.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Áreas de entrega</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestão de CEP, taxa e prazo de entrega.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Nova área
          </button>
        </div>

        <ListFilters search={search} onSearchChange={setSearch} />

        <DataTable
          data={filtered}
          columns={[
            { key: 'name', title: 'Nome' },
            {
              key: 'faixa',
              title: 'Faixa de CEP',
              render: (row) => `${row.zipCodeStart} - ${row.zipCodeEnd}`,
            },
            {
              key: 'deliveryFee',
              title: 'Taxa',
              render: (row) => `R$ ${Number(row.deliveryFee ?? 0).toFixed(2)}`,
            },
            {
              key: 'estimatedMinutes',
              title: 'Prazo',
              render: (row) => `${row.estimatedMinutes} min`,
            },
            {
              key: 'isActive',
              title: 'Status',
              render: (row) => (
                <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
              ),
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <RowActions editHref={`/delivery-areas/${row.id}`} />
              ),
            },
          ]}
        />

        <Modal open={open} title="Nova área de entrega" onClose={() => setOpen(false)}>
          <DeliveryAreaForm
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
