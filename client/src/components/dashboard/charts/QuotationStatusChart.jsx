import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS = {
  Draft: '#94a3b8',
  Sent: '#3b82f6',
  Accepted: '#10b981',
  Rejected: '#f43f5e',
  Expired: '#f59e0b',
};

export default function QuotationStatusChart({ data }) {
  const series = (data || []).map((d) => ({
    status: d.status,
    count: d.count,
    fill: STATUS_COLORS[d.status] || '#94a3b8',
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
          cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {series.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
