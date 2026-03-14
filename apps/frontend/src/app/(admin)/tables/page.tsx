'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type TableRow = {
  id: string;
  name: string;
  capacity: number;
  status: string;
  reservations: Array<{ id: string; guestName: string; reservationAt: string }>;
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/tables')
      .then((response) => setTables(response as TableRow[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar mesas'),
      );
  }, []);

  return (
    <PageShell title="Mesas" description="Mapa simplificado do salão usando os dados reais da API.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => (
          <div key={table.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{table.name}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {table.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Capacidade: {table.capacity}</p>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Próximas reservas
              </p>
              <div className="mt-2 space-y-2">
                {table.reservations.length ? (
                  table.reservations.map((reservation) => (
                    <div key={reservation.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {reservation.guestName}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sem reservas vinculadas.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
