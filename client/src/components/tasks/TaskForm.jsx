import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import taskService from '../../services/task.service';
import { toDateInputValue } from '../../utils/formatters';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants';

const inputCls =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

function Field({ label, error, required, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export default function TaskForm({
  mode = 'create',
  defaultValues,
  defaultLeadId,
  onSubmit,
  onCancel,
}) {
  const [leads, setLeads] = useState([]);
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [dueDate, setDueDate] = useState(
    toDateInputValue(defaultValues?.dueDate) || toDateInputValue(new Date())
  );
  const [priority, setPriority] = useState(defaultValues?.priority || 'Medium');
  const [status, setStatus] = useState(defaultValues?.status || 'Pending');
  const [leadId, setLeadId] = useState(
    defaultValues?.lead?._id || defaultValues?.lead || defaultLeadId || ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await taskService.listLeadsMinimal();
        if (!cancelled) setLeads(data?.leads || []);
      } catch {
        if (!cancelled) toast.error('Failed to load leads list');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function validate() {
    const next = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!dueDate) next.dueDate = 'Due date is required';
    if (!TASK_PRIORITIES.includes(priority)) next.priority = 'Invalid priority';
    if (mode === 'edit' && !TASK_STATUSES.includes(status)) next.status = 'Invalid status';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        priority,
        lead: leadId || null,
      };
      if (mode === 'edit') payload.status = status;
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Title" required error={errors.title}>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Call customer, send proposal, …"
        />
      </Field>

      <Field label="Description">
        <textarea
          rows={3}
          className={inputCls}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add context for this task"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Due date" required error={errors.dueDate}>
          <input
            type="date"
            className={inputCls}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Field>

        <Field label="Priority" error={errors.priority}>
          <select
            className={inputCls}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Linked lead">
          <select
            className={inputCls}
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
          >
            <option value="">— No lead —</option>
            {leads.map((l) => (
              <option key={l._id} value={l._id}>
                {l.customerName} {l.status ? `(${l.status})` : ''}
              </option>
            ))}
          </select>
        </Field>

        {mode === 'edit' && (
          <Field label="Status" error={errors.status}>
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {mode === 'edit' ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}
