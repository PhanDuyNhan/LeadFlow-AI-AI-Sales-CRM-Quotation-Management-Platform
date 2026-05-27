import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import quotationService from '../../services/quotation.service';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function RelatedQuotations({ leadId }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    quotationService
      .listByLead(leadId)
      .then((data) => {
        if (cancelled) return;
        setItems(data?.quotations || []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.response?.data?.message || 'Failed to load quotations';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">Related quotations</h2>
        <Button
          variant="secondary"
          onClick={() => navigate(`/quotations/create?lead=${leadId}`)}
        >
          + New quotation
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading quotations…" />
      ) : error ? (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No quotations have been created for this lead yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((q) => (
            <li key={q._id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <Link to={`/quotations/${q._id}`} className="text-sm font-medium text-indigo-700 hover:underline">
                  {q.quotationCode}
                </Link>
                <div className="text-xs text-slate-500">
                  {formatDate(q.createdAt)} • Valid until {formatDate(q.validUntil)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge value={q.status} type="quotation" />
                <span className="text-sm font-semibold text-slate-800">
                  {formatCurrency(q.totalAmount)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
