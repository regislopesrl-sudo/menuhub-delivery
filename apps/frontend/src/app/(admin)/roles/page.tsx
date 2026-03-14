'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DataTable } from '@/components/ui/data-table';
import { api } from '@/services/api';

export default function RolesPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.get('/roles').then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <PermissionGuard permission="roles.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Perfis</h1>
          <p className="mt-1 text-sm text-slate-500">Perfis de acesso e permissoes.</p>
        </div>

        <DataTable
          data={rows}
          columns={[
            { key: 'name', title: 'Perfil' },
            { key: 'description', title: 'Descricao' },
            {
              key: 'permissions',
              title: 'Qtd. permissoes',
              render: (row) => row.permissions?.length ?? 0,
            },
          ]}
        />
      </div>
    </PermissionGuard>
  );
}
