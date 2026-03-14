'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type Supplier = {
  id: string;
  name: string;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/suppliers')
      .then((response) => setSuppliers(response as Supplier[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar fornecedores'),
      );
  }, []);

  return (
    <PageShell title="Fornecedores" description="Fornecedores usados no módulo de compras.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{supplier.name}</h2>
            <p className="mt-2 text-sm text-slate-500">Documento: {supplier.document ?? '-'}</p>
            <p className="text-sm text-slate-500">Telefone: {supplier.phone ?? '-'}</p>
            <p className="text-sm text-slate-500">E-mail: {supplier.email ?? '-'}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
