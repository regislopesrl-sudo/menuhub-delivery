'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { PurchasingForm } from '@/components/forms/purchasing-form';
import { api } from '@/services/api';

export default function PurchasingNewPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/suppliers')
      .then((response) => setSuppliers(response.data ?? response))
      .catch(() => setSuppliers([]));
    api
      .get('/stock/items')
      .then((response) => setStockItems(response.data ?? response))
      .catch(() => setStockItems([]));
  }, []);

  return (
    <PermissionGuard permission="purchasing.order_create">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Novo pedido de compra
        </h1>
        <PurchasingForm suppliers={suppliers} stockItems={stockItems} />
      </div>
    </PermissionGuard>
  );
}
