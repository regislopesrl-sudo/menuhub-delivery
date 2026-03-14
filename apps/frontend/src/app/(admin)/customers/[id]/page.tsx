'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { CustomerForm } from '@/components/forms/customer-form';
import { api } from '@/services/api';

type Customer = {
  id: string;
  name?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
};

export default function CustomerEditPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (params.id) {
      api
        .get(`/customers/${params.id}`)
        .then((response) => setCustomer(response as Customer))
        .catch(() => setCustomer(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="customers.update">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar cliente</h1>
        </div>

        {customer ? <CustomerForm initialData={customer} /> : null}
      </div>
    </PermissionGuard>
  );
}
