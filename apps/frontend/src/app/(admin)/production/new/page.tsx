'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { ProductionForm } from '@/components/forms/production-form';
import { api } from '@/services/api';

export default function ProductionNewPage() {
  const [stockItems, setStockItems] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/stock/items')
      .then((response) => setStockItems(response.data ?? response))
      .catch(() => setStockItems([]));
  }, []);

  return (
    <PermissionGuard permission="production.create">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Nova ordem de produção
        </h1>
        <ProductionForm stockItems={stockItems} />
      </div>
    </PermissionGuard>
  );
}
