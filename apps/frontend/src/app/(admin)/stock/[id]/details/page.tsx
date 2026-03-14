'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function StockItemDetailsPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      api.get(`/stock/items/${params.id}`).then(setItem).catch(() => setItem(null));
    }
  }, [params.id]);

  return (
    <PermissionGuard permission="stock.view">
      <div className="space-y-6">
        {!item ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Item não encontrado.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{item.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Unidade: {item.stockUnit ?? '-'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Saldo e custo</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Saldo atual: {Number(item.currentQuantity ?? 0).toFixed(3)}</p>
                  <p>Mínimo: {Number(item.minimumQuantity ?? 0).toFixed(3)}</p>
                  <p>Custo médio: R$ {Number(item.averageCost ?? 0).toFixed(2)}</p>
                  <p>Último custo: R$ {Number(item.lastCost ?? 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Configurações</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Controla lote: {item.controlsBatch ? 'Sim' : 'Não'}</p>
                  <p>Controla validade: {item.controlsExpiry ? 'Sim' : 'Não'}</p>
                  <p>FEFO: {item.requiresFefo ? 'Sim' : 'Não'}</p>
                  <p>Perecível: {item.isPerishable ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Lotes</h2>

              <div className="mt-4 space-y-3">
                {item.batches?.length ? (
                  item.batches.map((batch: any) => (
                    <div key={batch.id} className="text-sm text-slate-600">
                      Lote: {batch.batchNumber ?? '-'} • Saldo:{' '}
                      {Number(batch.availableQuantity ?? 0).toFixed(3)}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sem lotes cadastrados.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Movimentações</h2>

              <div className="mt-4 space-y-3">
                {item.movements?.length ? (
                  item.movements.map((movement: any) => (
                    <div key={movement.id} className="text-sm text-slate-600">
                      {movement.movementType} • {Number(movement.quantity ?? 0).toFixed(3)} •{' '}
                      {movement.createdAt
                        ? new Date(movement.createdAt).toLocaleString('pt-BR')
                        : '-'}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Sem movimentações.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
