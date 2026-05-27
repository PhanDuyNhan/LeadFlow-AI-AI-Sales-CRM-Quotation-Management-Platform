import { useMemo } from 'react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

function emptyItem() {
  return { name: '', description: '', quantity: 1, unitPrice: 0 };
}

export default function LineItemEditor({
  items = [],
  onChange,
  discount = 0,
  tax = 0,
  onDiscountChange,
  onTaxChange,
  isLocked = false,
  errors,
}) {
  const list = items.length ? items : [emptyItem()];

  const totals = useMemo(() => {
    let subtotal = 0;
    list.forEach((item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      subtotal += q * p;
    });
    const d = Number(discount) || 0;
    const t = Number(tax) || 0;
    const total = Math.max(0, subtotal - d + t);
    return { subtotal, total };
  }, [list, discount, tax]);

  function updateItem(idx, patch) {
    const next = list.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  }

  function addRow() {
    onChange([...list, emptyItem()]);
  }

  function removeRow(idx) {
    if (list.length === 1) return;
    onChange(list.filter((_, i) => i !== idx));
  }

  const inputCls =
    'w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <div className="space-y-3">
      {isLocked && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Items are locked because this quotation is Accepted.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2 w-1/3">Name</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 w-24">Qty</th>
              <th className="px-3 py-2 w-32">Unit price</th>
              <th className="px-3 py-2 w-32 text-right">Total</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {list.map((item, idx) => {
              const q = Number(item.quantity) || 0;
              const p = Number(item.unitPrice) || 0;
              const line = q * p;
              return (
                <tr key={idx}>
                  <td className="px-3 py-2 align-top">
                    <input
                      className={inputCls}
                      placeholder="e.g. CRM Pro subscription"
                      value={item.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      className={inputCls}
                      placeholder="Optional details"
                      value={item.description || ''}
                      onChange={(e) => updateItem(idx, { description: e.target.value })}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={inputCls}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, { unitPrice: e.target.value })}
                      disabled={isLocked}
                    />
                  </td>
                  <td className="px-3 py-2 align-top text-right text-slate-700 font-medium">
                    {formatCurrency(line)}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      disabled={isLocked || list.length === 1}
                      className="text-xs text-rose-600 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {errors && <p className="text-xs text-rose-600">{errors}</p>}

      {!isLocked && (
        <div>
          <Button type="button" variant="secondary" onClick={addRow}>
            + Add line item
          </Button>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Discount
          </span>
          <input
            type="number"
            min="0"
            step="any"
            className={inputCls}
            value={discount}
            onChange={(e) => onDiscountChange(e.target.value)}
            disabled={isLocked}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Tax</span>
          <input
            type="number"
            min="0"
            step="any"
            className={inputCls}
            value={tax}
            onChange={(e) => onTaxChange(e.target.value)}
            disabled={isLocked}
          />
        </label>

        <div className="sm:col-span-2 mt-2 flex justify-end items-end gap-6 text-sm">
          <div className="text-right">
            <div className="text-xs text-slate-500">Subtotal</div>
            <div className="font-semibold text-slate-800">{formatCurrency(totals.subtotal)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-lg font-bold text-indigo-700">{formatCurrency(totals.total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
