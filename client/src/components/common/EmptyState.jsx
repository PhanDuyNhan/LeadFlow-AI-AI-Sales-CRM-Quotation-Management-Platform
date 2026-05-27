export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl">
        ∅
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
