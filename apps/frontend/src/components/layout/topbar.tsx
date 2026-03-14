'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getSessionUser, type SessionUser } from '@/lib/auth';
import { api } from '@/services/api';

export function Topbar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  async function handleLogout() {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // Logout local continua sendo suficiente aqui.
      }
    }

    clearSession();
    router.push('/login');
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">Operação</p>
        <p className="text-sm font-medium text-slate-900">
          {user?.name ?? 'Usuário'}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        Sair
      </button>
    </header>
  );
}
