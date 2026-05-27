const COLORS = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
};

export default function MetricCard({
  title,
  value,
  hint,
  color = 'slate',
  icon,
}) {
  const tone = COLORS[color] || COLORS.slate;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-bold text-slate-800 truncate">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        {icon && (
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-semibold border ${tone}`}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
