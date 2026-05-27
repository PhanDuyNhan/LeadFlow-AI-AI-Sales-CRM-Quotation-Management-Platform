const STATUS_STYLES = {
  New: 'bg-slate-100 text-slate-700 border-slate-200',
  Contacted: 'bg-blue-100 text-blue-700 border-blue-200',
  Qualified: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Quoted: 'bg-violet-100 text-violet-700 border-violet-200',
  Negotiating: 'bg-amber-100 text-amber-800 border-amber-200',
  Won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Lost: 'bg-rose-100 text-rose-700 border-rose-200',
};

const SCORE_STYLES = {
  Hot: 'bg-rose-100 text-rose-700 border-rose-200',
  Warm: 'bg-amber-100 text-amber-800 border-amber-200',
  Cold: 'bg-sky-100 text-sky-700 border-sky-200',
};

const SOURCE_STYLES = 'bg-slate-100 text-slate-700 border-slate-200';

export default function Badge({ value, type = 'status', className = '' }) {
  if (!value) return <span className="text-slate-400 text-xs">—</span>;

  let styles = SOURCE_STYLES;
  if (type === 'status') styles = STATUS_STYLES[value] || SOURCE_STYLES;
  if (type === 'score') styles = SCORE_STYLES[value] || SOURCE_STYLES;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles} ${className}`}
    >
      {value}
    </span>
  );
}
