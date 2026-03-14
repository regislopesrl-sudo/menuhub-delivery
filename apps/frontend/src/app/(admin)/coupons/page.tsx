'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/page-shell';
import { StatePanel } from '@/components/ui/state-panel';
import { api } from '@/services/api';

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  isActive: boolean;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/coupons')
      .then((response) => setCoupons(response as Coupon[]))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar cupons'),
      );
  }, []);

  return (
    <PageShell title="Cupons" description="Cupons já cadastrados no backend paralelo.">
      {error ? <StatePanel title="Erro" description={error} /> : null}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{coupon.code}</td>
                <td className="px-4 py-3 text-slate-600">{coupon.discountType}</td>
                <td className="px-4 py-3 text-slate-600">{coupon.discountValue}</td>
                <td className="px-4 py-3 text-slate-600">
                  {coupon.isActive ? 'Ativo' : 'Inativo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
