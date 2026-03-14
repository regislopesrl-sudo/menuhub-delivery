'use client';

import { useMemo, useState } from 'react';
import { api } from '@/services/api';
import { TextInput } from '@/components/ui/text-input';
import { useToast } from '@/components/ui/toast-provider';

type ProductFormData = {
  id?: string;
  categoryId?: string | null;
  name?: string;
  description?: string | null;
  salePrice?: number | string | null;
  promotionalPrice?: number | string | null;
  sku?: string | null;
  prepTimeMinutes?: number | string | null;
};

export function ProductForm({
  categories,
  initialData,
  onSuccess,
}: {
  categories?: any[];
  initialData?: ProductFormData | null;
  onSuccess?: () => void;
}) {
  const { showToast } = useToast();
  const categoryOptions = categories ?? [];
  const [form, setForm] = useState({
    categoryId: initialData?.categoryId ?? '',
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    salePrice: initialData?.salePrice ? String(initialData.salePrice) : '',
    promotionalPrice: initialData?.promotionalPrice
      ? String(initialData.promotionalPrice)
      : '',
    sku: initialData?.sku ?? '',
    prepTimeMinutes: initialData?.prepTimeMinutes
      ? String(initialData.prepTimeMinutes)
      : '',
  });
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    return {
      name: !form.name.trim() ? 'Nome é obrigatório' : '',
      salePrice:
        !form.salePrice || Number(form.salePrice) <= 0
          ? 'Preço deve ser maior que zero'
          : '',
    };
  }, [form]);

  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasErrors) return;

    setLoading(true);

    try {
      const payload = {
        categoryId: form.categoryId || undefined,
        name: form.name,
        description: form.description,
        salePrice: Number(form.salePrice),
        promotionalPrice: form.promotionalPrice
          ? Number(form.promotionalPrice)
          : undefined,
        sku: form.sku,
        prepTimeMinutes: form.prepTimeMinutes
          ? Number(form.prepTimeMinutes)
          : undefined,
      };

      if (initialData?.id) {
        await api.patch(`/products/${initialData.id}`, payload);
        showToast('Produto atualizado com sucesso', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Produto criado com sucesso', 'success');
      }

      onSuccess?.();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao salvar produto',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Selecione</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <TextInput
          label="Nome"
          value={form.name}
          onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <TextInput
        label="Descrição"
        value={form.description}
        onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
      />

      <div>
        <TextInput
          label="Preço de venda"
          type="number"
          value={form.salePrice}
          onChange={(value) => setForm((prev) => ({ ...prev, salePrice: value }))}
        />
        {errors.salePrice ? (
          <p className="mt-1 text-xs text-red-600">{errors.salePrice}</p>
        ) : null}
      </div>

      <TextInput
        label="Preço promocional"
        type="number"
        value={form.promotionalPrice}
        onChange={(value) => setForm((prev) => ({ ...prev, promotionalPrice: value }))}
      />

      <TextInput
        label="SKU"
        value={form.sku}
        onChange={(value) => setForm((prev) => ({ ...prev, sku: value }))}
      />

      <TextInput
        label="Tempo de preparo (min)"
        type="number"
        value={form.prepTimeMinutes}
        onChange={(value) => setForm((prev) => ({ ...prev, prepTimeMinutes: value }))}
      />

      <button
        type="submit"
        disabled={loading || hasErrors}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
