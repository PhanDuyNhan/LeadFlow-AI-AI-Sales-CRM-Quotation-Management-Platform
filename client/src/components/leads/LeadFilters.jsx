import { LEAD_STATUSES, LEAD_SOURCES, LEAD_SCORES } from '../../utils/constants';

function Select({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      <span>{label}</span>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {children}
      </select>
    </label>
  );
}

export default function LeadFilters({ filters, onChange, onReset }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Select label="Status" value={filters.status} onChange={(v) => update('status', v)}>
        <option value="">All</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Select label="Source" value={filters.source} onChange={(v) => update('source', v)}>
        <option value="">All</option>
        {LEAD_SOURCES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <Select label="Score" value={filters.leadScore} onChange={(v) => update('leadScore', v)}>
        <option value="">All</option>
        {LEAD_SCORES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          <span>From</span>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => update('dateFrom', e.target.value || undefined)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          <span>To</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => update('dateTo', e.target.value || undefined)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>
      </div>

      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
