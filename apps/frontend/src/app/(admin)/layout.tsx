'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession, getAccessToken } from '@/lib/auth';
import { api } from '@/services/api';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    async function validateSession() {
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await api.get('/auth/me');
      } catch {
        clearSession();
        router.push('/login');
      }
    }

    void validateSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
