'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function ReportsPage() {
  const [ordersReport, setOrdersReport] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);

  useEffect(() => {
    api.get('/reports/orders').then(setOrdersReport).catch(() => setOrdersReport(null));
    api
      .get('/reports/financial')
      .then(setFinancialReport)
      .catch(() => setFinancialReport(null));
  }, []);

  return (
    <PermissionGuard permission="reports.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Relatorios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores operacionais e gerenciais.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total de pedidos</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {ordersReport?.totalOrders ?? 0}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total vendido</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              R$ {Number(ordersReport?.totalSales ?? 0).toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Contas a receber</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              R$ {Number(financialReport?.receivable ?? 0).toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Contas a pagar</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              R$ {Number(financialReport?.payable ?? 0).toFixed(2)}
            </h2>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
