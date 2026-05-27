import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import leadService from '../services/lead.service';
import LeadForm from '../components/leads/LeadForm';
import AILeadPanel from '../components/leads/AILeadPanel';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { LEAD_STATUSES } from '../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

function Section({ title, children, action }) {
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

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [noteBody, setNoteBody] = useState('');
  const [noteBusy, setNoteBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leadService.getLead(id);
      setLead(data);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load lead';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(nextStatus) {
    if (!lead || nextStatus === lead.status) return;
    setStatusBusy(true);
    try {
      const updated = await leadService.updateLeadStatus(id, nextStatus);
      setLead(updated);
      toast.success(`Status set to ${nextStatus}`);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleEditSubmit(values) {
    try {
      const updated = await leadService.updateLead(id, values);
      setLead(updated);
      setEditing(false);
      toast.success('Lead updated');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update lead';
      toast.error(message);
      throw err;
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setNoteBusy(true);
    try {
      const updated = await leadService.addLeadNote(id, noteBody.trim());
      setLead(updated);
      setNoteBody('');
      toast.success('Note added');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to add note';
      toast.error(message);
    } finally {
      setNoteBusy(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await leadService.deleteLead(id);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <LoadingSpinner label="Loading lead…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white border border-rose-200 rounded-xl p-6 text-center">
          <p className="text-sm text-rose-700">{error}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/leads')}>Back to leads</Button>
            <Button onClick={load}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      <div>
        <button
          type="button"
          onClick={() => navigate('/leads')}
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          ← Back to leads
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{lead.customerName}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge value={lead.status} type="status" />
            <Badge value={lead.leadScore} type="score" />
            {lead.source && <span className="text-xs text-slate-500">via {lead.source}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <Section title="Edit lead">
          <LeadForm
            mode="edit"
            defaultValues={lead}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditing(false)}
          />
        </Section>
      ) : (
        <>
          <Section
            title="Status"
            action={
              <div className="flex items-center gap-2">
                <select
                  value={lead.status}
                  disabled={statusBusy}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            }
          >
            <p className="text-sm text-slate-600">
              Move the lead through your sales funnel by changing its status.
            </p>
          </Section>

          <Section title="Contact">
            <dl>
              <InfoRow label="Phone">{lead.phone}</InfoRow>
              <InfoRow label="Email">{lead.email || '—'}</InfoRow>
              <InfoRow label="Company">{lead.company || '—'}</InfoRow>
              <InfoRow label="Source">{lead.source || '—'}</InfoRow>
            </dl>
          </Section>

          <Section title="Opportunity">
            <dl>
              <InfoRow label="Budget">{formatCurrency(lead.budget)}</InfoRow>
              <InfoRow label="Timeline">{lead.timeline || '—'}</InfoRow>
              <InfoRow label="Need">{lead.needDescription || '—'}</InfoRow>
              <InfoRow label="Next follow-up">{formatDate(lead.nextFollowUpDate)}</InfoRow>
            </dl>
          </Section>

          <AILeadPanel lead={lead} onLeadUpdated={setLead} />

          <Section title="Notes">
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Add a note about this lead…"
              />
              <div className="flex justify-end">
                <Button type="submit" loading={noteBusy} disabled={!noteBody.trim()}>
                  Add note
                </Button>
              </div>
            </form>

            <ul className="mt-4 space-y-3">
              {lead.notes?.length ? (
                lead.notes
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((note) => (
                    <li key={note._id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.body}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {note.author?.name || 'Unknown'} • {formatDateTime(note.createdAt)}
                      </p>
                    </li>
                  ))
              ) : (
                <li className="text-sm text-slate-500">No notes yet.</li>
              )}
            </ul>
          </Section>

          <Section title="Meta">
            <dl>
              <InfoRow label="Created by">{lead.createdBy?.name || '—'}</InfoRow>
              <InfoRow label="Assigned to">{lead.assignedTo?.name || '—'}</InfoRow>
              <InfoRow label="Created at">{formatDateTime(lead.createdAt)}</InfoRow>
              <InfoRow label="Updated at">{formatDateTime(lead.updatedAt)}</InfoRow>
            </dl>
          </Section>
        </>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete lead?"
        message={`This will permanently delete "${lead.customerName}". This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setShowDelete(false)}
      />
    </div>
  );
}
