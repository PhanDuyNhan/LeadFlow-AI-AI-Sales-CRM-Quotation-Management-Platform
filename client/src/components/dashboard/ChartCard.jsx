import EmptyState from '../common/EmptyState';

export default function ChartCard({ title, subtitle, isEmpty, emptyMessage, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {isEmpty ? (
        <EmptyState title="No data yet" message={emptyMessage || 'Nothing to chart here yet.'} />
      ) : (
        <div className="h-64 w-full">{children}</div>
      )}
    </div>
  );
}
