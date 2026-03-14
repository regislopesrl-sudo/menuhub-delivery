'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { AdvancedOrderFilters } from '@/components/ui/advanced-order-filters';
import { DataTable } from '@/components/ui/data-table';
import { Drawer } from '@/components/ui/drawer';
import { KpiCard } from '@/components/ui/kpi-card';
import { OrderQuickView } from '@/components/ui/order-quick-view';
import { Pagination } from '@/components/ui/pagination';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/services/api';

export default function OrdersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [orderType, setOrderType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  function load() {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', '10');
    if (status) params.set('status', status);
    if (channel) params.set('channel', channel);
    if (orderType) params.set('orderType', orderType);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    api
      .get(`/orders?${params.toString()}`)
      .then((response) => {
        setRows(response.data ?? []);
        setMeta(response.meta ?? { totalPages: 1, total: 0 });
      })
      .catch(() => {
        setRows([]);
        setMeta({ totalPages: 1, total: 0 });
      });
  }

  useEffect(() => {
    load();
  }, [status, channel, orderType, startDate, endDate, page]);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const query = search.toLowerCase();
      const matchesSearch =
        String(item.orderNumber ?? '').toLowerCase().includes(query) ||
        String(item.customer?.name ?? '').toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [rows, search]);

  const total = useMemo(
    () => filteredRows.reduce((acc, item) => acc + Number(item.totalAmount ?? 0), 0),
    [filteredRows],
  );

  return (
    <PermissionGuard permission="orders.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
            <p className="mt-1 text-sm text-slate-500">Gestão completa dos pedidos.</p>
          </div>

          <Link
            href="/orders/new"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo pedido
          </Link>
        </div>

        <AdvancedOrderFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          channel={channel}
          onChannelChange={(value) => {
            setChannel(value);
            setPage(1);
          }}
          orderType={orderType}
          onOrderTypeChange={(value) => {
            setOrderType(value);
            setPage(1);
          }}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard title="Pedidos na página" value={filteredRows.length} />
          <KpiCard title="Valor total" value={`R$ ${total.toFixed(2)}`} />
          <KpiCard title="Total geral" value={meta.total} />
        </div>

        <DataTable
          data={filteredRows}
          columns={[
            {
              key: 'orderNumber',
              title: 'Pedido',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${row.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    #{row.orderNumber}
                  </Link>
                  <button
                    onClick={async () => {
                      const data = await api.get(`/orders/${row.id}`);
                      setSelectedOrder(data);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Ver rápido
                  </button>
                </div>
              ),
            },
            {
              key: 'customer',
              title: 'Cliente',
              render: (row) => row.customer?.name ?? '-',
            },
            { key: 'channel', title: 'Canal' },
            {
              key: 'status',
              title: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'totalAmount',
              title: 'Total',
              render: (row) => `R$ ${Number(row.totalAmount ?? 0).toFixed(2)}`,
            },
          ]}
        />

        <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />

        <Drawer
          open={!!selectedOrder}
          title="Visualização rápida do pedido"
          onClose={() => setSelectedOrder(null)}
        >
          {selectedOrder ? <OrderQuickView order={selectedOrder} /> : null}
        </Drawer>
      </div>
    </PermissionGuard>
  );
}
