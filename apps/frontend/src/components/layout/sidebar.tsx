'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { hasPermission } from '@/lib/auth';

const sections = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', permission: 'dashboard.view' },
      { label: 'Pedidos', href: '/orders', permission: 'orders.view' },
      { label: 'KDS', href: '/kds', permission: 'kds.view' },
    ],
  },
  {
    title: 'Cardapio',
    items: [
      { label: 'Produtos', href: '/products', permission: 'products.view' },
      { label: 'Categorias', href: '/categories', permission: 'categories.view' },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { label: 'Clientes', href: '/customers', permission: 'customers.view' },
      { label: 'Fidelidade', href: '/loyalty', permission: 'loyalty.view' },
    ],
  },
  {
    title: 'Operacao',
    items: [
      { label: 'Estoque', href: '/stock', permission: 'stock.view' },
      { label: 'Compras', href: '/purchasing', permission: 'purchasing.view' },
      { label: 'Fornecedores', href: '/suppliers', permission: 'purchasing.view' },
      { label: 'Producao', href: '/production', permission: 'production.view' },
      { label: 'Delivery', href: '/delivery', permission: 'delivery.view' },
      { label: 'WhatsApp', href: '/whatsapp', permission: 'whatsapp.view' },
    ],
  },
  {
    title: 'Gestao',
    items: [
      { label: 'Financeiro', href: '/financial', permission: 'financial.view' },
      { label: 'Relatorios', href: '/reports', permission: 'reports.view' },
      { label: 'Usuarios', href: '/users', permission: 'users.view' },
      { label: 'Perfis', href: '/roles', permission: 'roles.view' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const visibleSections = ready
    ? sections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => hasPermission(item.permission)),
        }))
        .filter((section) => section.items.length > 0)
    : [];

  return (
    <aside className="w-72 min-h-screen bg-slate-900 text-white p-5">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Sistema Delivery</h1>
        <p className="text-xs text-slate-400 mt-1">Painel administrativo</p>
      </div>

      <nav className="space-y-6">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-500">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
