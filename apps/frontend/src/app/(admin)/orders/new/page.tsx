'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { OrderCreateForm } from '@/components/forms/order-create-form';

export default function NewOrderPage() {
  return (
    <PermissionGuard permission="orders.create">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo pedido</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pedido com cliente, endereço, pagamento e carrinho.
          </p>
        </div>

        <OrderCreateForm />
      </div>
    </PermissionGuard>
  );
}
