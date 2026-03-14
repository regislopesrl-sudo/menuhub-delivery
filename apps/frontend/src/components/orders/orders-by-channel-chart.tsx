'use client';

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#94a3b8', '#64748b', '#334155', '#0f172a'];

export function OrdersByChannelChart({ data }: { data: any[] }) {
  return (
    <div className="h-[360px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Pedidos por canal</h3>

      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="channel" outerRadius={100}>
              {data.map((entry, index) => (
                <Cell key={entry.channel} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
