'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function CloseCommandButton({ commandId }: { commandId: string }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function closeCommand() {
    setLoading(true);

    try {
      await api.patch(`/commands/${commandId}/close`);
      showToast('Comanda fechada com sucesso', 'success');
      window.location.reload();
    } catch (error: any) {
      showToast(error.message || 'Erro ao fechar comanda', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={closeCommand}
      disabled={loading}
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 disabled:opacity-60"
    >
      {loading ? 'Fechando...' : 'Fechar'}
    </button>
  );
}
