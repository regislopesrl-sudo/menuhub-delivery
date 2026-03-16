'use client';

import { useEffect, useState } from 'react';
import { SalesPeriodChart } from '@/components/dashboard/sales-period-chart';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { OrdersByChannelChart } from '@/components/orders/orders-by-channel-chart';
import { OrdersByStatusChart } from '@/components/orders/orders-by-status-chart';
import { KpiCard } from '@/components/ui/kpi-card';
import { DeliveryAreaChart } from '@/components/charts/delivery-area-chart';
import { api } from '@/services/api';

export default function DashboardPage() {
  const [financial, setFinancial] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [salesPeriod, setSalesPeriod] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDashboard, setDeliveryDashboard] = useState<any>(null);

  useEffect(() => {
    const ordersQuery = new URLSearchParams();
    const salesPeriodQuery = new URLSearchParams();

    Promise.all([
      api.get('/financial/dashboard').catch(() => null),
      api.get(`/reports/orders?${ordersQuery.toString()}`).catch(() => null),
      api.get('/reports/stock').catch(() => null),
      api.get(`/reports/sales-period?${salesPeriodQuery.toString()}`).catch(() => []),
      api
        .get(`/reports/delivery-dashboard?${salesPeriodQuery.toString()}`)
        .catch(() => null),
    ])
      .then(
        ([financialData, ordersData, stockData, salesPeriodData, deliveryData]) => {
          setFinancial(financialData);
          setOrders(ordersData);
          setStock(stockData);
          setSalesPeriod(salesPeriodData);
          setDeliveryDashboard(deliveryData);
        },
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <PermissionGuard permission="dashboard.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Resumo operacional do sistema.</p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Carregando dashboard...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard title="Pedidos" value={orders?.totalOrders ?? 0} />
              <KpiCard
                title="Vendas hoje"
                value={`R$ ${Number(financial?.salesToday ?? 0).toFixed(2)}`}
              />
              <KpiCard
                title="Receber pendente"
                value={`R$ ${Number(financial?.receivablePending ?? 0).toFixed(2)}`}
              />
              <KpiCard
                title="Itens em estoque baixo"
                value={stock?.lowStock?.length ?? 0}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SalesPeriodChart data={salesPeriod} />
              <DeliveryAreaChart data={deliveryDashboard?.byArea ?? []} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <KpiCard title="Pedidos" value={orders?.totalOrders ?? 0} />
              <KpiCard
                title="Vendas"
                value={`R$ ${Number(orders?.totalSales ?? 0).toFixed(2)}`}
              />
              <KpiCard
                title="Receber pendente"
                value={`R$ ${Number(financial?.receivablePending ?? 0).toFixed(2)}`}
              />
              <KpiCard
                title="Itens em estoque baixo"
                value={stock?.lowStock?.length ?? 0}
              />
              <KpiCard
                title="Tempo médio delivery"
                value={`${Number(
                  deliveryDashboard?.averageDeliveryMinutes ?? 0,
                ).toFixed(0)} min`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Resumo financeiro</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    Contas a pagar: R$ {Number(financial?.payablePending ?? 0).toFixed(2)}
                  </p>
                  <p>
                    Contas a receber: R$ {Number(financial?.receivablePending ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Estoque</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Total de itens: {stock?.totalItems ?? 0}</p>
                  <p>Itens abaixo do mínimo: {stock?.lowStock?.length ?? 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
