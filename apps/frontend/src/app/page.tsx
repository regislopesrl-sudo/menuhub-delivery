import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-4xl font-bold text-slate-900">Sistema Delivery Futuro</h1>
        <p className="mt-4 text-slate-600">
          Workspace paralelo criado do zero para evoluir o novo backend Prisma e o
          novo painel operacional sem interferir no sistema atual.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            href="/login"
          >
            Entrar no painel
          </Link>
          <a
            className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
            href="http://localhost:3100/docs"
          >
            Ver Swagger
          </a>
        </div>
      </div>
    </main>
  );
}

