'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/toast-provider';
import { TextInput } from '@/components/ui/text-input';

export function CustomerAutocomplete({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (customer: any) => void;
}) {
  const { showToast } = useToast();
  const [query, setQuery] = useState(value ?? '');
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setOptions([]);
      return;
    }

    let active = true;
    setLoading(true);

    api
      .get(`/customers/autocomplete/by-contact?q=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!active) return;
        setOptions(response ?? []);
      })
      .catch(() => {
        if (!active) return;
        showToast('Não foi possível buscar clientes', 'error');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, showToast]);

  const list = useMemo(() => {
    if (!options.length) return null;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg mt-1 max-h-48 overflow-auto">
        {options.map((customer) => (
          <button
            key={customer.id}
            type="button"
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              onSelect(customer);
              setQuery(customer.name ?? '');
              setOptions([]);
            }}
          >
            {customer.name}
            <span className="block text-xs text-slate-400">
              {customer.phone ?? customer.whatsapp ?? customer.email ?? '-'}
            </span>
          </button>
        ))}
      </div>
    );
  }, [options, onSelect]);

  return (
    <div className="relative">
      <TextInput
        label="Cliente (nome, telefone ou WhatsApp)"
        value={query}
        onChange={(value) => {
          setQuery(value);
          if (!value.trim()) {
            setOptions([]);
          }
        }}
      />
      {loading && (
        <p className="text-xs text-slate-500 mt-1">Buscando...</p>
      )}
      {list}
    </div>
  );
}
