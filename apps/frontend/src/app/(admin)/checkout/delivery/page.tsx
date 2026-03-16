'use client';

import { useMemo, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';
import { PermissionGuard } from '@/components/auth/permission-guard';

export default function CheckoutDeliveryPage() {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    customerName: '',
    phone: '',
  });

  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingArea, setLoadingArea] = useState(false);

  const canProceed = useMemo(() => deliveryInfo?.supported, [deliveryInfo]);

  async function handleSearchCep() {
    if (!form.cep) {
      showToast('Informe o CEP antes de buscar', 'error');
      return;
    }

    setLoadingCep(true);
    try {
      const data = await api.get(`/addresses/zipcode/${form.cep}`);
      setForm((prev) => ({
        ...prev,
        street: data.street ?? '',
        complement: data.complement ?? '',
        district: data.district ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
      }));
      showToast('CEP localizado com sucesso', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao consultar CEP', 'error');
    } finally {
      setLoadingCep(false);
    }
  }

  async function handleCheckArea() {
    if (!form.cep) {
      showToast('Informe o CEP antes de validar entrega', 'error');
      return;
    }

    setLoadingArea(true);
    try {
      const data = await api.post('/delivery/check-zipcode', { cep: form.cep });
      setDeliveryInfo(data);
      if (data.supported) {
        showToast('CEP atendido pela entrega', 'success');
      } else {
        showToast(data.message || 'CEP fora da área', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao validar área de entrega', 'error');
    } finally {
      setLoadingArea(false);
    }
  }

  return (
    <PermissionGuard permission="orders.create">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checkout delivery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Validação de CEP, taxa e prazo de entrega.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
              <input
                value={form.cep}
                onChange={(e) => setForm((prev) => ({ ...prev, cep: e.target.value }))}
                placeholder="CEP"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <button
                onClick={handleSearchCep}
                disabled={loadingCep}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                {loadingCep ? 'Buscando...' : 'Buscar CEP'}
              </button>
              <button
                onClick={handleCheckArea}
                disabled={loadingArea}
                className="rounded-xl bg-slate-900 text-white px-4 py-3 text-sm"
              >
                {loadingArea ? 'Validando...' : 'Validar entrega'}
              </button>
            </div>

            <input
              value={form.customerName}
              onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
              placeholder="Nome do cliente"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Telefone"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <input
              value={form.street}
              onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
              placeholder="Rua"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={form.number}
                onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="Número"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={form.complement}
                onChange={(e) => setForm((prev) => ({ ...prev, complement: e.target.value }))}
                placeholder="Complemento"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <input
              value={form.district}
              onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
              placeholder="Bairro"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="UF"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-900">Validação</h2>

            {!deliveryInfo ? (
              <p className="mt-4 text-sm text-slate-500">
                Informe e valide o CEP para calcular taxa e prazo.
              </p>
            ) : deliveryInfo.supported ? (
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Área: {deliveryInfo.deliveryAreaName}</p>
                <p>Taxa: R$ {Number(deliveryInfo.deliveryFee ?? 0).toFixed(2)}</p>
                <p>Prazo: {deliveryInfo.estimatedMinutes} min</p>
                <div className="pt-3">
                  <button
                    disabled={!canProceed}
                    className="w-full rounded-xl bg-green-600 text-white px-4 py-3 text-sm font-medium disabled:opacity-60"
                  >
                    Continuar pedido
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-red-600">
                {deliveryInfo.message ?? 'CEP fora da área de entrega'}
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
