import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/toast-provider';

export const metadata: Metadata = {
  title: 'Sistema Delivery Futuro',
  description: 'Workspace paralelo do novo sistema',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
