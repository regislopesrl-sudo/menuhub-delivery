'use client';

import { useEffect, useState } from 'react';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { api } from '@/services/api';

export default function WhatsappPage() {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    api
      .get('/whatsapp/conversations')
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  return (
    <PermissionGuard permission="whatsapp.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">WhatsApp</h1>
          <p className="mt-1 text-sm text-slate-500">
            Conversas, bot e atendimento humano.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {conversations.map((conversation: any) => (
              <div key={conversation.id} className="border-b border-slate-100 px-4 py-4">
                <div className="font-medium text-slate-900">
                  {conversation.customer?.name ?? conversation.phone}
                </div>
                <div className="mt-1 text-xs text-slate-500">{conversation.status}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Selecione uma conversa para visualizar as mensagens.
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
