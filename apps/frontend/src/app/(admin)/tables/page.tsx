'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { OpenCommandForm } from '@/components/forms/open-command-form';

export default function TablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTable, setSelectedTable] = useState<any>(null);

  function load() {
    api.get('/tables').then(setTables).catch(() => setTables([]));
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tables.filter((item) =>
      String(item.name ?? '').toLowerCase().includes(q),
    );
  }, [tables, search]);

  return (
    <PermissionGuard permission="orders.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mesas e comandas</h1>
            <p className="text-sm text-slate-500 mt-1">
              Operação de salão, ocupação e consumo.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar mesa"
            className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.map((table) => {
            const activeOrders = table.orders ?? [];
            const total = activeOrders.reduce(
              (acc: number, order: any) => acc + Number(order.totalAmount ?? 0),
              0,
            );

            return (
              <div
                key={table.id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {table.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Capacidade: {table.capacity ?? 1}
                    </p>
                  </div>

                  <StatusBadge status={table.status} />
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <p>Pedidos ativos: {activeOrders.length}</p>
                  <p>Consumo atual: R$ {total.toFixed(2)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTable(table)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    Abrir comanda
                  </button>

                  <Link
                    href={`/tables/${table.id}`}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  >
                    Ver detalhes
                  </Link>

                  <Link
                    href={`/orders/new?tableId=${table.id}`}
                    className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm"
                  >
                    Novo pedido
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <Modal
          open={!!selectedTable}
          title={`Abrir comanda - ${selectedTable?.name ?? ''}`}
          onClose={() => setSelectedTable(null)}
        >
          {selectedTable ? (
            <OpenCommandForm
              table={selectedTable}
              onSuccess={() => {
                setSelectedTable(null);
                load();
              }}
            />
          ) : null}
        </Modal>
      </div>
    </PermissionGuard>
  );
}
