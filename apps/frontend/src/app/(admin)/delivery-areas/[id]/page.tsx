'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { DeliveryAreaForm } from '@/components/forms/delivery-area-form';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function DeliveryAreaEditPage() {
  const params = useParams();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    setLoading(true);
    api
      .get(`/delivery-areas/${id}`)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <PermissionGuard permission="delivery.assign">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Editar área de entrega</h1>
        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : item ? (
          <DeliveryAreaForm initialData={item} />
        ) : (
          <p className="text-sm text-slate-500">Área não encontrada.</p>
        )}
      </div>
    </PermissionGuard>
  );
}
