'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { ProductionForm } from '@/components/forms/production-form';
import { api } from '@/services/api';

export default function ProductionEditPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [stockItems, setStockItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/production/orders').then((items) => {
      const found = (items ?? []).find((item: any) => item.id === params.id);
      setOrder(found ?? null);
    });
    api
      .get('/stock/items')
      .then((response) => setStockItems(response.data ?? response))
      .catch(() => setStockItems([]));
  }, [params.id]);

  return (
    <PermissionGuard permission="production.create">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Editar produção</h1>
        {order ? <ProductionForm initialData={order} stockItems={stockItems} /> : null}
      </div>
    </PermissionGuard>
  );
}
