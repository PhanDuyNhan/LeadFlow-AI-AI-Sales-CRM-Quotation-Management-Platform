import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatters';

function compactCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

export default function RevenueForecastChart({ data }) {
  const series = (data || []).map((d) => ({
    label: d.label,
    sent: Number(d.sent) || 0,
    accepted: Number(d.accepted) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rfSent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="rfAccepted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tickFormatter={compactCurrency} tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
          formatter={(value) => formatCurrency(value)}
        />
        <Area
          type="monotone"
          dataKey="sent"
          stroke="#3b82f6"
          fill="url(#rfSent)"
          strokeWidth={2}
          name="Sent"
        />
        <Area
          type="monotone"
          dataKey="accepted"
          stroke="#10b981"
          fill="url(#rfAccepted)"
          strokeWidth={2}
          name="Accepted"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
