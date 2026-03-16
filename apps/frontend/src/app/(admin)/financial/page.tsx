'use client';

import { useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';
import { KpiCard } from '@/components/ui/kpi-card';
import { DashboardPeriodFilter } from '@/components/dashboard/dashboard-period-filter';

export default function FinancialPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formattedDashboard = useMemo(() => {
    if (!dashboard) return null;
    if (!dashboard.salesToday) {
      return {
        ...dashboard,
        salesToday: dashboard.salesToday ?? 0,
      };
    }
    return dashboard;
  }, [dashboard]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);

    api
      .get(`/financial/dashboard?${params.toString()}`)
      .then(setDashboard)
      .catch(() => setDashboard(null));
  }, [startDate, endDate]);

  return (
    <PermissionGuard permission="financial.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-1">Visão consolidada por período.</p>
        </div>

        <DashboardPeriodFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard
            title="Vendas no período"
            value={`R$ ${Number(formattedDashboard?.salesToday ?? 0).toFixed(2)}`}
          />
          <KpiCard
            title="Receber no período"
            value={`R$ ${Number(formattedDashboard?.receivablesInPeriod ?? 0).toFixed(2)}`}
          />
          <KpiCard
            title="Pagar no período"
            value={`R$ ${Number(formattedDashboard?.payablesInPeriod ?? 0).toFixed(2)}`}
          />
          <KpiCard
            title="Receber pendente"
            value={`R$ ${Number(formattedDashboard?.receivablesPending ?? 0).toFixed(2)}`}
          />
          <KpiCard
            title="Pagar pendente"
            value={`R$ ${Number(formattedDashboard?.payablesPending ?? 0).toFixed(2)}`}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
