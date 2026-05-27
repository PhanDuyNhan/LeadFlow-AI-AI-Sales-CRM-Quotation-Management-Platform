import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const PALETTE = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

export default function LeadBySourceChart({ data }) {
  const series = (data || []).map((d, i) => ({
    name: d.source || 'Unknown',
    value: d.count,
    fill: PALETTE[i % PALETTE.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
        />
        <Legend
          verticalAlign="bottom"
          height={32}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Pie
          data={series}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={2}
        >
          {series.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
