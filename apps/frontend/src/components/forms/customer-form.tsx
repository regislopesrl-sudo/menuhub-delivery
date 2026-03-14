'use client';

import { useMemo, useState } from 'react';
import { api } from '@/services/api';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast-provider';

type CustomerAddressFormData = {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  reference: string;
  deliveryAreaId?: string;
  ibgeCode?: string;
};

type CustomerFormData = {
  id?: string;
  name?: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  isVip?: boolean | null;
  isBlocked?: boolean | null;
  addresses?: Array<{
    zipCode?: string | null;
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    reference?: string | null;
    deliveryAreaId?: string | null;
    ibgeCode?: string | null;
  }>;
};

export function CustomerForm({
  onSuccess,
  initialData,
}: {
  onSuccess?: () => void;
  initialData?: CustomerFormData | null;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    phone: initialData?.phone ?? '',
    whatsapp: initialData?.whatsapp ?? '',
    email: initialData?.email ?? '',
    isVip: initialData?.isVip ?? false,
    isBlocked: initialData?.isBlocked ?? false,
  });
  const [address, setAddress] = useState<CustomerAddressFormData>({
    zipCode: initialData?.addresses?.[0]?.zipCode ?? '',
    street: initialData?.addresses?.[0]?.street ?? '',
    number: initialData?.addresses?.[0]?.number ?? '',
    complement: initialData?.addresses?.[0]?.complement ?? '',
    district: initialData?.addresses?.[0]?.district ?? '',
    city: initialData?.addresses?.[0]?.city ?? '',
    state: initialData?.addresses?.[0]?.state ?? '',
    reference: initialData?.addresses?.[0]?.reference ?? '',
    deliveryAreaId: initialData?.addresses?.[0]?.deliveryAreaId ?? undefined,
    ibgeCode: initialData?.addresses?.[0]?.ibgeCode ?? undefined,
  });
  const [loading, setLoading] = useState(false);
  const [zipCodeLoading, setZipCodeLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    supported?: boolean;
    deliveryAreaName?: string;
    deliveryFee?: number;
    estimatedMinutes?: number;
  } | null>(null);

  const errors = useMemo(() => {
    return {
      name: !form.name.trim() ? 'Nome é obrigatório' : '',
    };
  }, [form]);

  async function lookupZipCode() {
    const zipCode = address.zipCode.replace(/\D/g, '');
    if (zipCode.length !== 8) {
      showToast('Informe um CEP válido', 'error');
      return;
    }

    setZipCodeLoading(true);

    try {
      const zipData = await api.get(`/addresses/zipcode/${zipCode}`);
      setAddress((prev) => ({
        ...prev,
        zipCode: zipData.cep ?? zipCode,
        street: zipData.street ?? '',
        district: zipData.district ?? '',
        city: zipData.city ?? '',
        state: zipData.state ?? '',
        ibgeCode: zipData.ibgeCode ?? undefined,
      }));

      const area = await api.post('/delivery/check-zipcode', { zipCode });
      setAddress((prev) => ({
        ...prev,
        deliveryAreaId: area.deliveryAreaId ?? undefined,
      }));
      setDeliveryInfo(area);
    } catch (error) {
      setDeliveryInfo(null);
      showToast(error instanceof Error ? error.message : 'Erro ao buscar CEP', 'error');
    } finally {
      setZipCodeLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (errors.name) return;

    setLoading(true);

    try {
      const payload = {
        ...form,
        addresses:
          address.street && address.number && address.district && address.city && address.state
            ? [
                {
                  zipCode: address.zipCode || undefined,
                  street: address.street,
                  number: address.number,
                  complement: address.complement || undefined,
                  district: address.district,
                  city: address.city,
                  state: address.state,
                  reference: address.reference || undefined,
                  deliveryAreaId: address.deliveryAreaId,
                  ibgeCode: address.ibgeCode,
                  isDefault: true,
                },
              ]
            : undefined,
      };

      if (initialData?.id) {
        await api.patch(`/customers/${initialData.id}`, payload);
        showToast('Cliente atualizado com sucesso', 'success');
      } else {
        await api.post('/customers', payload);
        showToast('Cliente criado com sucesso', 'success');
      }

      onSuccess?.();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao salvar cliente',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <TextInput
          label="Nome"
          value={form.name}
          onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>
      <TextInput
        label="Telefone"
        value={form.phone}
        onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
      />
      <TextInput
        label="WhatsApp"
        value={form.whatsapp}
        onChange={(value) => setForm((prev) => ({ ...prev, whatsapp: value }))}
      />
      <TextInput
        label="E-mail"
        value={form.email}
        onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
      />

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-4">
          <h3 className="font-medium text-slate-900">Endereço</h3>
          <p className="mt-1 text-sm text-slate-500">
            Informe o CEP para preencher o endereço e validar a área de entrega.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex gap-2 md:col-span-2">
            <div className="flex-1">
              <TextInput
                label="CEP"
                value={address.zipCode}
                onChange={(value) => setAddress((prev) => ({ ...prev, zipCode: value }))}
              />
            </div>
            <button
              type="button"
              onClick={lookupZipCode}
              disabled={zipCodeLoading}
              className="mt-7 rounded-xl border border-slate-300 px-4 py-3 text-sm"
            >
              {zipCodeLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          <TextInput
            label="Rua"
            value={address.street}
            onChange={(value) => setAddress((prev) => ({ ...prev, street: value }))}
          />
          <TextInput
            label="Número"
            value={address.number}
            onChange={(value) => setAddress((prev) => ({ ...prev, number: value }))}
          />
          <TextInput
            label="Complemento"
            value={address.complement}
            onChange={(value) => setAddress((prev) => ({ ...prev, complement: value }))}
          />
          <TextInput
            label="Bairro"
            value={address.district}
            onChange={(value) => setAddress((prev) => ({ ...prev, district: value }))}
          />
          <TextInput
            label="Cidade"
            value={address.city}
            onChange={(value) => setAddress((prev) => ({ ...prev, city: value }))}
          />
          <TextInput
            label="Estado"
            value={address.state}
            onChange={(value) => setAddress((prev) => ({ ...prev, state: value }))}
          />
          <div className="md:col-span-2">
            <TextInput
              label="Referência"
              value={address.reference}
              onChange={(value) => setAddress((prev) => ({ ...prev, reference: value }))}
            />
          </div>
        </div>

        {deliveryInfo ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              {deliveryInfo.supported
                ? `Área: ${deliveryInfo.deliveryAreaName ?? '-'}`
                : 'CEP fora da área de entrega'}
            </p>
            {deliveryInfo.supported ? (
              <>
                <p className="mt-1">
                  Taxa: R$ {Number(deliveryInfo.deliveryFee ?? 0).toFixed(2)}
                </p>
                <p className="mt-1">
                  Prazo estimado: {deliveryInfo.estimatedMinutes ?? 0} min
                </p>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isVip}
          onChange={(e) => setForm((prev) => ({ ...prev, isVip: e.target.checked }))}
        />
        Cliente VIP
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isBlocked}
          onChange={(e) => setForm((prev) => ({ ...prev, isBlocked: e.target.checked }))}
        />
        Cliente bloqueado
      </label>

      <button
        type="submit"
        disabled={loading || !!errors.name}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
