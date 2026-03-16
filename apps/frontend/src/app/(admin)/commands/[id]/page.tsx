'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { CommandCloseForm } from '@/components/forms/command-close-form';
import { CommandTransferForm } from '@/components/commands/command-transfer-form';
import { StatusBadge } from '@/components/ui/status-badge';
import { CommandPrintButton } from '@/components/commands/command-print-button';

export default function CommandDetailPage() {
  const params = useParams();
  const [command, setCommand] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<any[]>([]);
  const [openCommands, setOpenCommands] = useState<any[]>([]);

  const commandId = useMemo(() => {
    if (!params.id) return '';
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const loadAuxData = useCallback(() => {
    api.get('/tables').then(setTables).catch(() => setTables([]));
    api
      .get('/commands')
      .then((data) =>
        setOpenCommands(
          (data ?? []).filter((item: any) => item.id !== commandId && item.status === 'open'),
        ),
      )
      .catch(() => setOpenCommands([]));
  }, [commandId]);

  const loadCommand = useCallback(() => {
    if (!commandId) return;
    setLoading(true);
    api
      .get(`/commands/${commandId}`)
      .then(setCommand)
      .catch(() => setCommand(null))
      .finally(() => setLoading(false));
  }, [commandId]);

  useEffect(() => {
    loadCommand();
    loadAuxData();
  }, [loadCommand, loadAuxData]);

  const summary = useMemo(() => {
    if (!command) return { subtotal: 0, discountAmount: 0, extraFee: 0, finalAmount: 0 };
    const subtotal = (command.orders ?? []).reduce(
      (acc: number, order: any) => acc + Number(order.totalAmount ?? 0),
      0,
    );
    return {
      subtotal,
      discountAmount: command.summary?.discountAmount ?? 0,
      extraFee: command.summary?.extraFee ?? 0,
      finalAmount: command.summary?.finalAmount ?? subtotal,
    };
  }, [command]);

  return (
    <PermissionGuard permission="orders.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Comanda #{command?.code ?? params.id}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Status: <StatusBadge status={command?.status ?? 'open'} />
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Carregando comanda...
          </div>
        ) : !command ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Comanda não encontrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Pedidos</h2>
                <div className="space-y-4">
                  {(command.orders ?? []).map((order: any) => (
                    <div key={order.id} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">Pedido #{order.orderNumber}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="mt-2 space-y-2 text-sm text-slate-600">
                        <p>
                          Total R$ {Number(order.totalAmount ?? 0).toFixed(2)} •{' '}
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </p>
                        {(order.items ?? []).map((item: any) => (
                          <div key={item.id} className="ml-2">
                            <p>
                              {Number(item.quantity)}x {item.productNameSnapshot} • R$
                              {Number(item.totalPrice ?? 0).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">Resumo</h3>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>R$ {summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Desconto</span>
                  <span>- R$ {summary.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Taxa extra</span>
                  <span>R$ {summary.extraFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-slate-900 pt-2">
                  <span>Total final</span>
                  <span>R$ {summary.finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <CommandCloseForm
                command={command}
                onSuccess={() => {
                  loadCommand();
                }}
              />
              <CommandTransferForm
                command={command}
                tables={tables}
                openCommands={openCommands}
                onSuccess={() => {
                  loadCommand();
                  loadAuxData();
                }}
              />
              <CommandPrintButton command={command} />
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
