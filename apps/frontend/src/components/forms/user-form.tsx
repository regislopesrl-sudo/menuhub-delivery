'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast-provider';

type UserFormProps = {
  roles: any[];
  onSuccess?: () => void;
  initialData?: any;
};

export function UserForm({ roles, onSuccess, initialData }: UserFormProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    password: '',
    roleIds: initialData?.roles?.map((r: any) => r.roleId ?? r.role?.id) ?? [],
  });
  const [loading, setLoading] = useState(false);

  function toggleRole(roleId: string) {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id: string) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        roleIds: form.roleIds,
      };

      if (!initialData?.id && form.password) {
        payload.password = form.password;
      }

      if (initialData?.id) {
        await api.patch(`/users/${initialData.id}`, payload);
        showToast('Usuário atualizado com sucesso', 'success');
      } else {
        payload.password = form.password;
        await api.post('/users', payload);
        showToast('Usuário criado com sucesso', 'success');
      }

      onSuccess?.();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao salvar usuário',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        label="Nome"
        value={form.name}
        onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
      />
      <TextInput
        label="E-mail"
        value={form.email}
        onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
      />
      <TextInput
        label="Telefone"
        value={form.phone}
        onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
      />
      {!initialData?.id ? (
        <TextInput
          label="Senha"
          type="password"
          value={form.password}
          onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
        />
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Perfis</label>
        <div className="space-y-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.roleIds.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
              {role.name}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
