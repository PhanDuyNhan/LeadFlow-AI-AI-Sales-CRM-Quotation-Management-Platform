import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome{user ? `, ${user.name}` : ''}. Authentication is wired up — lead, quotation, task,
          and analytics modules ship in later phases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">Signed in as</div>
          <div className="mt-2 text-lg font-semibold text-slate-800">{user?.name}</div>
          <div className="text-sm text-slate-500">{user?.email}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">Role</div>
          <div className="mt-2 text-lg font-semibold text-slate-800 capitalize">
            {user?.role || '—'}
          </div>
          <div className="text-sm text-slate-500">Role middleware foundation is in place.</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">Phase status</div>
          <div className="mt-2 text-lg font-semibold text-slate-800">Phase 2 ✓</div>
          <div className="text-sm text-slate-500">
            Auth backend + frontend complete. Next: Lead Management (Phase 4).
          </div>
        </div>
      </div>
    </div>
  );
}
