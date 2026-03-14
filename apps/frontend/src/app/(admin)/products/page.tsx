'use client';

import { useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { ProductForm } from '@/components/forms/product-form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable } from '@/components/ui/data-table';
import { ListFilters } from '@/components/ui/list-filters';
import { Modal } from '@/components/ui/modal';
import { RowActions } from '@/components/ui/row-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { ToggleButton } from '@/components/ui/toggle-button';
import { useToast } from '@/components/ui/toast-provider';
import { api } from '@/services/api';

export default function ProductsPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (status) params.set('isActive', String(status === 'active'));

    api
      .get(`/products?${params.toString()}`)
      .then((response) => setRows(response.data ?? response))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    load();
    api.get('/categories').then(setCategories).catch(() => setCategories([]));
  }, [status]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      return (
        String(row.name ?? '').toLowerCase().includes(q) ||
        String(row.sku ?? '').toLowerCase().includes(q) ||
        String(row.category?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    try {
      await api.delete(`/products/${deleteId}`);
      showToast('Produto excluído com sucesso', 'success');
      setDeleteId(null);
      load();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao excluir produto',
        'error',
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggle(id: string) {
    setTogglingId(id);

    try {
      await api.patch(`/products/${id}/toggle`);
      showToast('Status do produto atualizado', 'success');
      load();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao alterar status do produto',
        'error',
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <PermissionGuard permission="products.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
            <p className="mt-1 text-sm text-slate-500">Cadastro e gestão do cardápio.</p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Novo produto
          </button>
        </div>

        <ListFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={[
            { label: 'Ativo', value: 'active' },
            { label: 'Inativo', value: 'inactive' },
          ]}
        />

        <DataTable
          data={filteredRows}
          columns={[
            { key: 'name', title: 'Nome' },
            {
              key: 'category',
              title: 'Categoria',
              render: (row) => row.category?.name ?? '-',
            },
            { key: 'sku', title: 'SKU' },
            {
              key: 'salePrice',
              title: 'Preço',
              render: (row) => `R$ ${Number(row.salePrice ?? 0).toFixed(2)}`,
            },
            {
              key: 'isActive',
              title: 'Status',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.isActive ? 'active' : 'inactive'} />
                  <ToggleButton
                    active={row.isActive}
                    onClick={() => handleToggle(row.id)}
                    loading={togglingId === row.id}
                  />
                </div>
              ),
            },
            {
              key: 'actions',
              title: 'Ações',
              render: (row) => (
                <RowActions
                  detailHref={`/products/${row.id}/details`}
                  editHref={`/products/${row.id}`}
                  onDelete={() => setDeleteId(row.id)}
                />
              ),
            },
          ]}
        />

        <Modal open={open} title="Novo produto" onClose={() => setOpen(false)}>
          <ProductForm
            categories={categories}
            onSuccess={() => {
              setOpen(false);
              load();
            }}
          />
        </Modal>

        <ConfirmDialog
          open={!!deleteId}
          title="Excluir produto"
          description="Essa ação fará exclusão lógica do produto. Deseja continuar?"
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </PermissionGuard>
  );
}
