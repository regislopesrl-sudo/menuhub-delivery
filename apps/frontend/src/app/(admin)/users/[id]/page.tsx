'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { UserForm } from '@/components/forms/user-form';
import { api } from '@/services/api';

export default function UserEditPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      api.get(`/users/${params.id}`).then(setUser).catch(() => setUser(null));
      api.get('/roles').then(setRoles).catch(() => setRoles([]));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="users.update">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar usuário</h1>
        </div>

        {user ? <UserForm roles={roles} initialData={user} /> : null}
      </div>
    </PermissionGuard>
  );
}
