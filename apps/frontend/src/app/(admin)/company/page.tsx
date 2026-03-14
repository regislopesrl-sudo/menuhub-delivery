'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type Company = {
  legalName: string;
  tradeName: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  branches: Array<{ id: string; name: string; city: string | null; state: string | null }>;
};

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/companies/me')
      .then((response) => setCompany(response as Company))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar empresa'),
      );
  }, []);

  return (
    <PageShell title="Empresa" description="Dados da empresa e filiais padrão do workspace.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      {company ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <StatePanel
            title={company.tradeName}
            description={`Razão social: ${company.legalName}\nCNPJ: ${company.cnpj ?? '-'}\nE-mail: ${company.email ?? '-'}\nTelefone: ${company.phone ?? '-'}`}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Filiais</h2>
            <div className="mt-4 space-y-3">
              {company.branches.map((branch) => (
                <div key={branch.id} className="rounded-xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">{branch.name}</p>
                  <p className="text-sm text-slate-500">
                    {branch.city ?? '-'} / {branch.state ?? '-'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <StatePanel title="Carregando empresa" />
      )}
    </PageShell>
  );
}
