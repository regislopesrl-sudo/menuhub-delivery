'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { DeliveryForm } from '@/components/forms/delivery-form';

export default function DeliveryNewPage() {
  return (
    <PermissionGuard permission="delivery.create_courier">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Novo entregador</h1>
        <DeliveryForm />
      </div>
    </PermissionGuard>
  );
}
