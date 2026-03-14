'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function LoyaltyPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);

  useEffect(() => {
    api.get('/loyalty/coupons').then(setCoupons).catch(() => setCoupons([]));
    api.get('/loyalty/giftcards').then(setGiftCards).catch(() => setGiftCards([]));
  }, []);

  return (
    <PermissionGuard permission="loyalty.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fidelidade</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cupons, gift cards e programa de pontos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 font-semibold">Cupons</div>
            {coupons.map((coupon: any) => (
              <div key={coupon.id} className="border-b border-slate-100 px-5 py-4">
                <div className="font-medium text-slate-900">{coupon.code}</div>
                <div className="text-sm text-slate-500">
                  {coupon.discountType} - R$ {Number(coupon.discountValue).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 font-semibold">Gift cards</div>
            {giftCards.map((card: any) => (
              <div key={card.id} className="border-b border-slate-100 px-5 py-4">
                <div className="font-medium text-slate-900">{card.code}</div>
                <div className="text-sm text-slate-500">
                  Saldo: R$ {Number(card.currentBalance).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
