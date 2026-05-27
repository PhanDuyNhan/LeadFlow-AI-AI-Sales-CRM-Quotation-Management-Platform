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

const QUOTATION_STYLES = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Sent: 'bg-blue-100 text-blue-700 border-blue-200',
  Accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  Expired: 'bg-amber-100 text-amber-800 border-amber-200',
};

const TASK_STATUS_STYLES = {
  Pending: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Overdue: 'bg-rose-100 text-rose-700 border-rose-200',
};

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-rose-100 text-rose-700 border-rose-200',
};

const SOURCE_STYLES = 'bg-slate-100 text-slate-700 border-slate-200';

export default function Badge({ value, type = 'status', className = '' }) {
  if (!value) return <span className="text-slate-400 text-xs">—</span>;

  let styles = SOURCE_STYLES;
  if (type === 'status') styles = STATUS_STYLES[value] || SOURCE_STYLES;
  if (type === 'score') styles = SCORE_STYLES[value] || SOURCE_STYLES;
  if (type === 'quotation') styles = QUOTATION_STYLES[value] || SOURCE_STYLES;
  if (type === 'taskStatus') styles = TASK_STATUS_STYLES[value] || SOURCE_STYLES;
  if (type === 'priority') styles = PRIORITY_STYLES[value] || SOURCE_STYLES;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles} ${className}`}
    >
      {value}
    </span>
  );
}
