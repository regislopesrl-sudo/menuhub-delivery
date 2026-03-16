'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { StatusBadge } from '@/components/ui/status-badge';

export default function SupplierDetailsPage() {
  const params = useParams();
  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      api.get(`/suppliers/${params.id}`).then(setSupplier).catch(() => setSupplier(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="purchasing.view">
      <div className="space-y-6">
        {!supplier ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 text-slate-500">
            Fornecedor não encontrado.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{supplier.name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {supplier.document ?? '-'} • {supplier.phone ?? '-'}
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <h2 className="text-lg font-semibold text-slate-900">Dados</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>E-mail: {supplier.email ?? '-'}</p>
                  <p>Telefone: {supplier.phone ?? '-'}</p>
                  <p>Documento: {supplier.document ?? '-'}</p>
                  <p>Observações: {supplier.notes ?? '-'}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                <h2 className="text-lg font-semibold text-slate-900">Compras</h2>
                <div className="mt-4 space-y-3">
                  {supplier.purchaseOrders?.length ? (
                    supplier.purchaseOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                          R$ {Number(order.totalAmount ?? 0).toFixed(2)}
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sem compras vinculadas.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <h2 className="text-lg font-semibold text-slate-900">Recebimentos</h2>
              <div className="mt-4 space-y-3">
                {supplier.goodsReceipts?.length ? (
                  supplier.goodsReceipts.map((receipt: any) => (
                    <div key={receipt.id} className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        NF {receipt.invoiceNumber ?? '-'}
                      </div>
                      <StatusBadge status={receipt.status} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sem recebimentos vinculados.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
