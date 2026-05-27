import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function LeadTable({ leads, loading, error, onDelete, emptyAction }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <LoadingSpinner label="Loading leads…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-6 text-center">
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <EmptyState
          title="No leads found"
          message="Adjust your filters, or create your first lead to get started."
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Budget</th>
            <th className="px-4 py-3">Assigned</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-700 hover:underline"
                  onClick={() => navigate(`/leads/${lead._id}`)}
                >
                  {lead.customerName}
                </button>
                {lead.company && <div className="text-xs text-slate-500">{lead.company}</div>}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{lead.phone}</td>
              <td className="px-4 py-3"><Badge value={lead.status} type="status" /></td>
              <td className="px-4 py-3"><Badge value={lead.leadScore} type="score" /></td>
              <td className="px-4 py-3 text-sm text-slate-700">{lead.source || '—'}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{formatCurrency(lead.budget)}</td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {lead.assignedTo?.name || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatDate(lead.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="!px-2 !py-1 text-xs"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDelete?.(lead)}
                    className="!px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
