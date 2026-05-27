import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import LineItemEditor from './LineItemEditor';
import quotationService from '../../services/quotation.service';
import { toDateInputValue } from '../../utils/formatters';
import { QUOTATION_STATUSES } from '../../utils/constants';

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

function emptyItem() {
  return { name: '', description: '', quantity: 1, unitPrice: 0 };
}

export default function QuotationForm({
  mode = 'create',
  defaultValues,
  defaultLeadId,
  onSubmit,
  onCancel,
}) {
  const [leads, setLeads] = useState([]);
  const [code, setCode] = useState(defaultValues?.quotationCode || '');
  const [leadId, setLeadId] = useState(
    defaultValues?.lead?._id || defaultValues?.lead || defaultLeadId || ''
  );
  const [customerName, setCustomerName] = useState(defaultValues?.customerName || '');
  const [items, setItems] = useState(
    defaultValues?.items?.length ? defaultValues.items : [emptyItem()]
  );
  const [discount, setDiscount] = useState(defaultValues?.discount ?? 0);
  const [tax, setTax] = useState(defaultValues?.tax ?? 0);
  const [status, setStatus] = useState(defaultValues?.status || 'Draft');
  const [validUntil, setValidUntil] = useState(toDateInputValue(defaultValues?.validUntil));
  const [notes, setNotes] = useState(defaultValues?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const itemsLocked = mode === 'edit' && defaultValues?.status === 'Accepted';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await quotationService.listLeadsMinimal();
        if (!cancelled) setLeads(data?.leads || []);
      } catch {
        if (!cancelled) toast.error('Failed to load leads list');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'create' || code) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await quotationService.generateCode();
        if (!cancelled) setCode(data?.quotationCode || '');
      } catch {
        // Non-fatal — the user can type one in manually.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, code]);

  // Auto-fill customerName when picking a lead in create mode and the field is empty.
  useEffect(() => {
    if (mode !== 'create') return;
    if (!leadId || customerName.trim()) return;
    const lead = leads.find((l) => l._id === leadId);
    if (lead?.customerName) setCustomerName(lead.customerName);
  }, [leadId, leads, customerName, mode]);

  function validate() {
    const next = {};
    if (!leadId) next.lead = 'Please select a lead';
    if (!items.length) next.items = 'At least one item is required';
    items.forEach((item, idx) => {
      if (!item.name?.trim()) next[`item-${idx}-name`] = 'Item name is required';
      if (Number(item.quantity) < 0) next[`item-${idx}-qty`] = 'Quantity cannot be negative';
      if (Number(item.unitPrice) < 0) next[`item-${idx}-price`] = 'Unit price cannot be negative';
    });
    if (Number(discount) < 0) next.discount = 'Discount cannot be negative';
    if (Number(tax) < 0) next.tax = 'Tax cannot be negative';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        quotationCode: code?.trim() || undefined,
        lead: leadId,
        customerName: customerName?.trim() || undefined,
        items: items.map((i) => ({
          name: i.name.trim(),
          description: i.description?.trim() || undefined,
          quantity: Number(i.quantity) || 0,
          unitPrice: Number(i.unitPrice) || 0,
        })),
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        validUntil: validUntil || undefined,
        notes: notes?.trim() || undefined,
      };
      if (mode === 'edit') payload.status = status;
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Quotation code" error={errors.quotationCode}>
          <input
            className={inputCls}
            placeholder="QT-2026-001"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
        <Field label="Lead" required error={errors.lead}>
          <select
            className={inputCls}
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            disabled={mode === 'edit'}
          >
            <option value="">— Select a lead —</option>
            {leads.map((l) => (
              <option key={l._id} value={l._id}>
                {l.customerName} {l.status ? `(${l.status})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Customer name">
          <input
            className={inputCls}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </Field>
        <Field label="Valid until">
          <input
            type="date"
            className={inputCls}
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </Field>
        {mode === 'edit' && (
          <Field label="Status">
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              {QUOTATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Line items</h3>
        <LineItemEditor
          items={items}
          onChange={setItems}
          discount={discount}
          tax={tax}
          onDiscountChange={setDiscount}
          onTaxChange={setTax}
          isLocked={itemsLocked}
          errors={errors.items}
        />
      </div>

      <Field label="Notes">
        <textarea
          rows={3}
          className={inputCls}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes for this quotation"
        />
      </Field>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {mode === 'edit' ? 'Save changes' : 'Create quotation'}
        </Button>
      </div>
    </form>
  );
}
