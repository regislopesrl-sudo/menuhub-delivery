'use client';

type AdvancedOrderFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  channel: string;
  onChannelChange: (value: string) => void;
  orderType: string;
  onOrderTypeChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
};

export function AdvancedOrderFilters(props: AdvancedOrderFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <input
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          placeholder="Buscar pedido/cliente"
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <select
          value={props.status}
          onChange={(e) => props.onStatusChange(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Todos os status</option>
          <option value="PENDING_CONFIRMATION">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="IN_PREPARATION">Em preparo</option>
          <option value="READY">Pronto</option>
          <option value="FINALIZED">Finalizado</option>
          <option value="CANCELED">Cancelado</option>
        </select>

        <select
          value={props.channel}
          onChange={(e) => props.onChannelChange(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Todos os canais</option>
          <option value="admin">Admin</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="kiosk">Kiosk</option>
          <option value="site">Site</option>
        </select>

        <select
          value={props.orderType}
          onChange={(e) => props.onOrderTypeChange(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          <option value="">Todos os tipos</option>
          <option value="DELIVERY">Delivery</option>
          <option value="COUNTER">Balcão</option>
          <option value="PICKUP">Retirada</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>

        <input
          type="date"
          value={props.startDate}
          onChange={(e) => props.onStartDateChange(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />

        <input
          type="date"
          value={props.endDate}
          onChange={(e) => props.onEndDateChange(e.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        />
      </div>
    </div>
  );
}
