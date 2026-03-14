'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StockItemForm } from '@/components/forms/stock-item-form';
import { api } from '@/services/api';

type StockItem = {
  id: string;
  name?: string;
  stockUnit?: string | null;
  minimumQuantity?: number | string | null;
  averageCost?: number | string | null;
};

export default function StockEditPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<StockItem | null>(null);

  useEffect(() => {
    if (params.id) {
      api
        .get(`/stock/items/${params.id}`)
        .then((response) => setItem(response as StockItem))
        .catch(() => setItem(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="stock.update">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar item de estoque</h1>
        </div>

        {item ? <StockItemForm initialData={item} /> : null}
      </div>
    </PermissionGuard>
  );
}
