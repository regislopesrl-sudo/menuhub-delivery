'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setSession } from '@/lib/auth';
import { api } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', form) as {
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          name: string;
          email: string | null;
          phone?: string | null;
          roles: string[];
          permissions: string[];
        };
      };
      setSession(response);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900">Entrar no sistema</h1>
        <p className="text-sm text-slate-500 mt-2">
          Use suas credenciais para acessar o painel.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="******"
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
