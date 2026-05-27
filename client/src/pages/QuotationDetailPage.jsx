import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import quotationService from '../services/quotation.service';
import QuotationForm from '../components/quotations/QuotationForm';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

function Section({ title, action, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-800">{children}</dd>
    </div>
  );
}

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [acceptDialog, setAcceptDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [acceptMarkWon, setAcceptMarkWon] = useState(true);
  const [rejectLeadStatus, setRejectLeadStatus] = useState('Negotiating');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quotationService.getQuotation(id);
      setQuotation(data);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load quotation';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEditSubmit(payload) {
    try {
      const updated = await quotationService.updateQuotation(id, payload);
      setQuotation(updated);
      setEditing(false);
      toast.success('Quotation updated');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update quotation';
      toast.error(message);
      throw err;
    }
  }

  async function transitionStatus(nextStatus, leadStatus) {
    setStatusBusy(true);
    try {
      const result = await quotationService.updateQuotationStatus(id, {
        status: nextStatus,
        leadStatus,
      });
      setQuotation(result.quotation);
      toast.success(`Quotation marked ${nextStatus}${leadStatus ? ` • Lead → ${leadStatus}` : ''}`);
      setAcceptDialog(false);
      setRejectDialog(false);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await quotationService.deleteQuotation(id);
      toast.success('Quotation deleted');
      navigate('/quotations');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete quotation';
      toast.error(message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <LoadingSpinner label="Loading quotation…" />
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white border border-rose-200 rounded-xl p-6 text-center">
          <p className="text-sm text-rose-700">{error || 'Quotation not found'}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/quotations')}>Back to list</Button>
            <Button onClick={load}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  const isDraft = quotation.status === 'Draft';
  const canDelete = isDraft;
  const itemsLocked = quotation.status === 'Accepted';

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      <button
        type="button"
        onClick={() => navigate('/quotations')}
        className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
      >
        ← Back to quotations
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{quotation.quotationCode}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge value={quotation.status} type="quotation" />
            <span className="text-sm text-slate-500">
              For{' '}
              {quotation.lead?._id ? (
                <Link
                  to={`/leads/${quotation.lead._id}`}
                  className="text-indigo-700 hover:underline"
                >
                  {quotation.customerName || quotation.lead?.customerName || 'lead'}
                </Link>
              ) : (
                quotation.customerName || '—'
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing && !itemsLocked && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          {quotation.status === 'Draft' && (
            <Button onClick={() => transitionStatus('Sent')} loading={statusBusy}>
              Send
            </Button>
          )}
          {quotation.status === 'Sent' && (
            <>
              <Button onClick={() => setAcceptDialog(true)}>Accept</Button>
              <Button variant="secondary" onClick={() => setRejectDialog(true)}>
                Reject
              </Button>
            </>
          )}
          {canDelete && (
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <Section title="Edit quotation">
          <QuotationForm
            mode="edit"
            defaultValues={quotation}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(false)}
          />
        </Section>
      ) : (
        <>
          <Section title="Summary">
            <dl>
              <InfoRow label="Customer">{quotation.customerName || quotation.lead?.customerName || '—'}</InfoRow>
              <InfoRow label="Lead">
                {quotation.lead?._id ? (
                  <Link className="text-indigo-700 hover:underline" to={`/leads/${quotation.lead._id}`}>
                    {quotation.lead.customerName}
                  </Link>
                ) : '—'}
              </InfoRow>
              <InfoRow label="Valid until">{formatDate(quotation.validUntil)}</InfoRow>
              <InfoRow label="Notes">{quotation.notes || '—'}</InfoRow>
            </dl>
          </Section>

          <Section title="Line items">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items?.map((it) => (
                    <tr key={it._id}>
                      <td className="px-3 py-2 text-slate-800">{it.name}</td>
                      <td className="px-3 py-2 text-slate-600">{it.description || '—'}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{it.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-700">{formatCurrency(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right text-slate-800 font-medium">{formatCurrency(it.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Subtotal</div>
                <div className="font-semibold">{formatCurrency(quotation.subtotal)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Discount</div>
                <div className="font-semibold">−{formatCurrency(quotation.discount)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Tax</div>
                <div className="font-semibold">+{formatCurrency(quotation.tax)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-lg font-bold text-indigo-700">{formatCurrency(quotation.totalAmount)}</div>
              </div>
            </div>
          </Section>

          <Section title="Meta">
            <dl>
              <InfoRow label="Created by">{quotation.createdBy?.name || '—'}</InfoRow>
              <InfoRow label="Created at">{formatDateTime(quotation.createdAt)}</InfoRow>
              <InfoRow label="Updated at">{formatDateTime(quotation.updatedAt)}</InfoRow>
            </dl>
          </Section>
        </>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete quotation?"
        message={`This will permanently delete ${quotation.quotationCode}. Only Draft quotations can be deleted.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setShowDelete(false)}
      />

      {/* Accept dialog with optional "mark lead Won" */}
      {acceptDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => !statusBusy && setAcceptDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800">Accept this quotation?</h3>
            <p className="mt-2 text-sm text-slate-600">
              The quotation will be marked <strong>Accepted</strong> and line items will be locked.
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={acceptMarkWon}
                onChange={(e) => setAcceptMarkWon(e.target.checked)}
              />
              Also mark the linked lead as <strong>Won</strong>.
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAcceptDialog(false)} disabled={statusBusy}>
                Cancel
              </Button>
              <Button
                onClick={() => transitionStatus('Accepted', acceptMarkWon ? 'Won' : undefined)}
                loading={statusBusy}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog with lead status choice */}
      {rejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => !statusBusy && setRejectDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800">Reject this quotation?</h3>
            <p className="mt-2 text-sm text-slate-600">
              You can optionally move the linked lead to a different stage.
            </p>
            <label className="mt-4 flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Linked lead status
              </span>
              <select
                value={rejectLeadStatus}
                onChange={(e) => setRejectLeadStatus(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">(Leave unchanged)</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Lost">Lost</option>
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRejectDialog(false)} disabled={statusBusy}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => transitionStatus('Rejected', rejectLeadStatus || undefined)}
                loading={statusBusy}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
