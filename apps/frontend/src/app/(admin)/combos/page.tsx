'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type Combo = {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  items: Array<{ id: string; quantity: string; product: { name: string } }>;
};

export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/combos')
      .then((response) => setCombos(response as Combo[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar combos'),
      );
  }, []);

  return (
    <PageShell title="Combos" description="Combos disponíveis no catálogo.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {combos.map((combo) => (
          <div key={combo.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{combo.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{combo.description ?? '-'}</p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
                R$ {combo.price}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {combo.items.map((item) => (
                <div key={item.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {item.quantity}x {item.product.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
