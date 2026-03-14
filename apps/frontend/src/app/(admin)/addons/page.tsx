'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type AddonGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  items: Array<{ id: string; name: string; price: string }>;
};

export default function AddonsPage() {
  const [groups, setGroups] = useState<AddonGroup[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/addon-groups')
      .then((response) => setGroups(response as AddonGroup[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar adicionais'),
      );
  }, []);

  return (
    <PageShell title="Adicionais" description="Grupos e itens de adicionais cadastrados.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{group.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Seleção: {group.minSelect} a {group.maxSelect}
            </p>
            <div className="mt-4 space-y-2">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-900">{item.name}</span>
                  <span className="text-sm text-slate-500">R$ {item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
