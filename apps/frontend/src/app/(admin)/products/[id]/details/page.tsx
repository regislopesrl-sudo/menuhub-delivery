'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      api.get(`/products/${params.id}`).then(setProduct).catch(() => setProduct(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="products.view">
      <div className="space-y-6">
        {!product ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Produto não encontrado.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {product.category?.name ?? 'Sem categoria'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Informações</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>SKU: {product.sku ?? '-'}</p>
                  <p>Preço: R$ {Number(product.salePrice ?? 0).toFixed(2)}</p>
                  <p>
                    Promoção:{' '}
                    {product.promotionalPrice
                      ? `R$ ${Number(product.promotionalPrice).toFixed(2)}`
                      : '-'}
                  </p>
                  <p>Tempo de preparo: {product.prepTimeMinutes ?? 0} min</p>
                  <p>Status: {product.isActive ? 'Ativo' : 'Inativo'}</p>
                  <p>Destaque: {product.isFeatured ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Descrição</h2>
                <div className="mt-4 text-sm text-slate-600">
                  {product.description || 'Sem descrição.'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Adicionais</h2>

              <div className="mt-4 space-y-3">
                {product.addonLinks?.length ? (
                  product.addonLinks.map((link: any) => (
                    <div key={link.id} className="text-sm text-slate-600">
                      {link.addonGroup?.name ?? '-'}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sem adicionais vinculados.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
