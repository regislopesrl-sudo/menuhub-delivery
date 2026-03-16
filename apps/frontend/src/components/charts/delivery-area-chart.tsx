'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function DeliveryAreaChart({ data }: { data: any[] }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 h-[360px]">
      <h3 className="text-lg font-semibold text-slate-900">Pedidos por área</h3>

      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="area" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
