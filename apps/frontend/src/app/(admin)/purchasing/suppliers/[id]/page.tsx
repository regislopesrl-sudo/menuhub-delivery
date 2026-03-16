'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { SupplierForm } from '@/components/forms/supplier-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function SupplierEditPage() {
  const params = useParams();
  const [supplier, setSupplier] = useState<any | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api
      .get(`/suppliers/${params.id}`)
      .then(setSupplier)
      .catch(() => setSupplier(null));
  }, [params.id]);

  return (
    <PermissionGuard permission="purchasing.view">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Editar fornecedor</h1>
        {supplier ? <SupplierForm initialData={supplier} /> : null}
      </div>
    </PermissionGuard>
  );
}
