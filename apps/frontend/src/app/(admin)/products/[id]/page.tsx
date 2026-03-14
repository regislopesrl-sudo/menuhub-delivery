'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { ProductForm } from '@/components/forms/product-form';
import { api } from '@/services/api';

type Product = {
  id: string;
  name?: string;
  description?: string | null;
  salePrice?: number | string | null;
  sku?: string | null;
};

export default function ProductEditPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (params.id) {
      api
        .get(`/products/${params.id}`)
        .then((response) => setProduct(response as Product))
        .catch(() => setProduct(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="products.update">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar produto</h1>
        </div>

        {product ? <ProductForm initialData={product} /> : null}
      </div>
    </PermissionGuard>
  );
}
