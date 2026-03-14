'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function FinancialPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    api.get('/financial/dashboard').then(setDashboard).catch(() => setDashboard(null));
  }, []);

  return (
    <PermissionGuard permission="financial.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visao consolidada do caixa e contas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Vendas hoje" value={dashboard?.salesToday} />
          <Card title="Receber pendente" value={dashboard?.receivablePending} />
          <Card title="Pagar pendente" value={dashboard?.payablePending} />
        </div>
      </div>
    </PermissionGuard>
  );
}

function Card({ title, value }: { title: string; value?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        R$ {Number(value ?? 0).toFixed(2)}
      </h2>
    </div>
  );
}
