import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function QuotationTable({ quotations, loading, error, onDelete, emptyAction }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <LoadingSpinner label="Loading quotations…" />
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

  if (!quotations || quotations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <EmptyState
          title="No quotations yet"
          message="Create a quotation linked to a lead to get started."
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
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Customer / Lead</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Valid until</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {quotations.map((q) => (
            <tr key={q._id} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3">
                <button
                  type="button"
                  className="text-sm font-medium text-indigo-700 hover:underline"
                  onClick={() => navigate(`/quotations/${q._id}`)}
                >
                  {q.quotationCode}
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                <div>{q.customerName || q.lead?.customerName || '—'}</div>
                <div className="text-xs text-slate-500">{q.lead?.customerName || ''}</div>
              </td>
              <td className="px-4 py-3"><Badge value={q.status} type="quotation" /></td>
              <td className="px-4 py-3 text-sm text-slate-700 text-right">{formatCurrency(q.totalAmount)}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatDate(q.validUntil)}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatDate(q.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/quotations/${q._id}`)}
                    className="!px-2 !py-1 text-xs"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDelete?.(q)}
                    disabled={q.status !== 'Draft'}
                    className="!px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50"
                    title={q.status !== 'Draft' ? 'Only Draft quotations can be deleted' : ''}
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
