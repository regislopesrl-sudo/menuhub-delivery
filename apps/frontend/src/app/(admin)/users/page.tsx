'use client';

import { useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { UserForm } from '@/components/forms/user-form';
import { DataTable } from '@/components/ui/data-table';
import { ListFilters } from '@/components/ui/list-filters';
import { Modal } from '@/components/ui/modal';
import { RowActions } from '@/components/ui/row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { ToggleButton } from '@/components/ui/toggle-button';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/services/api';

export default function UsersPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function load() {
    api.get('/users').then(setRows).catch(() => setRows([]));
    api.get('/roles').then(setRoles).catch(() => setRoles([]));
  }

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      return (
        String(row.name ?? '').toLowerCase().includes(q) ||
        String(row.email ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  async function handleToggle(id: string) {
    setTogglingId(id);

    try {
      await api.patch(`/users/${id}/toggle-active`);
      showToast('Status do usuário atualizado', 'success');
      load();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao alterar status do usuário',
        'error',
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <PermissionGuard permission="users.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
            <p className="mt-1 text-sm text-slate-500">Gestão de acesso ao sistema.</p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo usuário
          </button>
        </div>

        <ListFilters search={search} onSearchChange={setSearch} />

        <DataTable
          data={filteredRows}
          columns={[
            { key: 'name', title: 'Nome' },
            { key: 'email', title: 'E-mail' },
            {
              key: 'roles',
              title: 'Perfis',
              render: (row) => row.roles?.map((r: any) => r.role?.name).join(', ') || '-',
            },
            {
              key: 'isActive',
              title: 'Status',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
                  <ToggleButton
                    active={row.isActive}
                    onClick={() => handleToggle(row.id)}
                    loading={togglingId === row.id}
                  />
                </div>
              ),
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => <RowActions editHref={`/users/${row.id}`} />,
            },
          ]}
        />

        <Modal open={open} title="Novo usuário" onClose={() => setOpen(false)}>
          <UserForm
            roles={roles}
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
