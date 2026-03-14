'use client';

import { hasPermission } from '@/lib/auth';

export function PermissionGuard({
  permission,
  children,
  fallback,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!hasPermission(permission)) {
    return (
      fallback ?? (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 text-sm text-slate-500">
          Voce nao tem permissao para acessar este conteudo.
        </div>
      )
    );
  }

  return <>{children}</>;
}
