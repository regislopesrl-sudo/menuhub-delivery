'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type Reservation = {
  id: string;
  guestName: string;
  guestPhone?: string | null;
  guestCount: number;
  status: string;
  table?: { name: string } | null;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/reservations')
      .then((response) => setReservations(response as Reservation[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar reservas'),
      );
  }, []);

  return (
    <PageShell title="Reservas" description="Reservas ativas e vinculadas às mesas.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Mesa</th>
              <th className="px-4 py-3">Pessoas</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {reservation.guestName}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {reservation.table?.name ?? '-'}
                </td>
                <td className="px-4 py-3 text-slate-600">{reservation.guestCount}</td>
                <td className="px-4 py-3 text-slate-600">{reservation.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
