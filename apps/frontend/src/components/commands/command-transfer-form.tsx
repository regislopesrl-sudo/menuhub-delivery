'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';

export function CommandTransferForm({
  command,
  tables,
  openCommands,
  onSuccess,
}: {
  command: any;
  tables: any[];
  openCommands: any[];
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [targetTableId, setTargetTableId] = useState('');
  const [targetCommandId, setTargetCommandId] = useState('');
  const [loading, setLoading] = useState(false);

  async function transferToTable() {
    if (!targetTableId || !command?.id) return;

    setLoading(true);
    try {
      await api.patch(`/commands/${command.id}/transfer`, { targetTableId });
      showToast('Comanda transferida para outra mesa', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao transferir mesa', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function transferToCommand() {
    if (!targetCommandId || !command?.id) return;

    setLoading(true);
    try {
      await api.patch(`/commands/${command.id}/transfer`, { targetCommandId });
      showToast('Comanda transferida para outra comanda', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Erro ao transferir comanda', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Transferência</h2>

      <div className="space-y-3">
        <select
          value={targetTableId}
          onChange={(e) => setTargetTableId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Transferir para mesa</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>

        <button
          onClick={transferToTable}
          disabled={loading || !targetTableId}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        >
          Transferir mesa
        </button>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <select
          value={targetCommandId}
          onChange={(e) => setTargetCommandId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Transferir para comanda</option>
          {openCommands
            .filter((item) => item.id !== command?.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.code}
              </option>
            ))}
        </select>

        <button
          onClick={transferToCommand}
          disabled={loading || !targetCommandId}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        >
          Transferir comanda
        </button>
      </div>
    </div>
  );
}
