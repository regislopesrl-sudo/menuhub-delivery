'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type Setting = {
  id: string;
  key: string;
  value: Record<string, unknown>;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((response) => setSettings(response as Setting[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar configurações'),
      );
  }, []);

  return (
    <PageShell title="Configurações" description="Configurações operacionais disponíveis no backend.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {settings.map((setting) => (
          <div key={setting.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{setting.key}</h2>
            <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(setting.value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
