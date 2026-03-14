'use client';

import { useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { CustomerForm } from '@/components/forms/customer-form';
import { DataTable } from '@/components/ui/data-table';
import { ListFilters } from '@/components/ui/list-filters';
import { Modal } from '@/components/ui/modal';
import { RowActions } from '@/components/ui/row-actions';
import { api } from '@/services/api';

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  function load() {
    const params = new URLSearchParams();
    if (status === 'vip') params.set('isVip', 'true');
    if (status === 'blocked') params.set('isBlocked', 'true');

    api
      .get(`/customers?${params.toString()}`)
      .then((response) => setRows(response.data ?? response))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    load();
  }, [status]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      return (
        String(row.name ?? '').toLowerCase().includes(q) ||
        String(row.phone ?? '').toLowerCase().includes(q) ||
        String(row.whatsapp ?? '').toLowerCase().includes(q) ||
        String(row.email ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  return (
    <PermissionGuard permission="customers.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Cadastro e histórico de clientes.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo cliente
          </button>
        </div>

        <ListFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={[
            { label: 'VIP', value: 'vip' },
            { label: 'Bloqueado', value: 'blocked' },
          ]}
        />

        <DataTable
          data={filteredRows}
          columns={[
            { key: 'name', title: 'Nome' },
            { key: 'phone', title: 'Telefone' },
            { key: 'whatsapp', title: 'WhatsApp' },
            { key: 'email', title: 'E-mail' },
            {
              key: 'isVip',
              title: 'VIP',
              render: (row) => (row.isVip ? 'Sim' : 'Não'),
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <RowActions
                  detailHref={`/customers/${row.id}/details`}
                  editHref={`/customers/${row.id}`}
                />
              ),
            },
          ]}
        />

        <Modal open={open} title="Novo cliente" onClose={() => setOpen(false)}>
          <CustomerForm
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
