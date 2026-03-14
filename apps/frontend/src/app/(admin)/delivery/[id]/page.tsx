'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DeliveryForm } from '@/components/forms/delivery-form';
import { api } from '@/services/api';

export default function DeliveryEditPage() {
  const params = useParams();
  const [courier, setCourier] = useState<any>(null);

  useEffect(() => {
    api.get('/couriers').then((items) => {
      const found = (items ?? []).find((item: any) => item.id === params.id);
      setCourier(found ?? null);
    });
  }, [params.id]);

  return (
    <PermissionGuard permission="delivery.update_courier">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Editar entregador</h1>
        {courier ? <DeliveryForm initialData={courier} /> : null}
      </div>
    </PermissionGuard>
  );
}
