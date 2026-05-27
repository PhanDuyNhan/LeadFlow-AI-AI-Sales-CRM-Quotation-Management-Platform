import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import { LEAD_STATUSES, LEAD_SOURCES, LEAD_SCORES } from '../../utils/constants';
import { toDateInputValue } from '../../utils/formatters';

const baseSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  email: z.string().trim().email('Invalid email').or(z.literal('')).optional(),
  company: z.string().trim().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  needDescription: z.string().optional().or(z.literal('')),
  budget: z
    .union([z.string(), z.number()])
    .transform((v) => (v === '' || v === null || v === undefined ? 0 : Number(v)))
    .refine((v) => Number.isFinite(v) && v >= 0, 'Budget must be a non-negative number'),
  timeline: z.string().optional().or(z.literal('')),
  status: z.string().optional().or(z.literal('')),
  leadScore: z.string().optional().or(z.literal('')),
  nextFollowUpDate: z.string().optional().or(z.literal('')),
});

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

const inputCls =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

export default function LeadForm({ mode = 'create', defaultValues, onSubmit, onCancel }) {
  const initial = {
    customerName: defaultValues?.customerName || '',
    phone: defaultValues?.phone || '',
    email: defaultValues?.email || '',
    company: defaultValues?.company || '',
    source: defaultValues?.source || '',
    needDescription: defaultValues?.needDescription || '',
    budget: defaultValues?.budget ?? 0,
    timeline: defaultValues?.timeline || '',
    status: defaultValues?.status || 'New',
    leadScore: defaultValues?.leadScore || '',
    nextFollowUpDate: toDateInputValue(defaultValues?.nextFollowUpDate),
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: initial,
  });

  async function submit(values) {
    const payload = {
      customerName: values.customerName.trim(),
      phone: values.phone.trim(),
      email: values.email?.trim() || undefined,
      company: values.company?.trim() || undefined,
      source: values.source || undefined,
      needDescription: values.needDescription?.trim() || undefined,
      budget: values.budget,
      timeline: values.timeline?.trim() || undefined,
      leadScore: values.leadScore || undefined,
      nextFollowUpDate: values.nextFollowUpDate || undefined,
    };
    if (mode === 'edit') {
      payload.status = values.status || undefined;
    }
    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Customer name" required error={errors.customerName?.message}>
          <input className={inputCls} {...register('customerName')} />
        </Field>
        <Field label="Phone" required error={errors.phone?.message}>
          <input className={inputCls} {...register('phone')} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" className={inputCls} {...register('email')} />
        </Field>
        <Field label="Company" error={errors.company?.message}>
          <input className={inputCls} {...register('company')} />
        </Field>

        <Field label="Source" error={errors.source?.message}>
          <select className={inputCls} {...register('source')}>
            <option value="">— Select source —</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget" error={errors.budget?.message}>
          <input type="number" min="0" step="any" className={inputCls} {...register('budget')} />
        </Field>

        <Field label="Timeline" error={errors.timeline?.message}>
          <input className={inputCls} placeholder="e.g. 1-2 months" {...register('timeline')} />
        </Field>
        <Field label="Next follow-up" error={errors.nextFollowUpDate?.message}>
          <input type="date" className={inputCls} {...register('nextFollowUpDate')} />
        </Field>

        {mode === 'edit' && (
          <Field label="Status" error={errors.status?.message}>
            <select className={inputCls} {...register('status')}>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Score (manual)" error={errors.leadScore?.message}>
          <select className={inputCls} {...register('leadScore')}>
            <option value="">— Not scored —</option>
            {LEAD_SCORES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Need description" error={errors.needDescription?.message}>
        <textarea
          rows={3}
          className={inputCls}
          placeholder="What is the customer looking for?"
          {...register('needDescription')}
        />
      </Field>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Save changes' : 'Create lead'}
        </Button>
      </div>
    </form>
  );
}
