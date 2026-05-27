import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import quotationService from '../services/quotation.service';
import QuotationTable from '../components/quotations/QuotationTable';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import { QUOTATION_STATUSES } from '../utils/constants';

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  status: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [data, setData] = useState({ quotations: [], pagination: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await quotationService.listQuotations(params);
      setData(result || { quotations: [], pagination: null });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load quotations';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onSearch = (value) => setParams((p) => ({ ...p, page: 1, search: value || '' }));
  const onStatusChange = (e) =>
    setParams((p) => ({ ...p, page: 1, status: e.target.value || undefined }));
  const onPageChange = (page) => setParams((p) => ({ ...p, page }));

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await quotationService.deleteQuotation(deleteTarget._id);
      toast.success(`Deleted ${deleteTarget.quotationCode}`);
      setDeleteTarget(null);
      await fetchList();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete quotation';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quotations</h1>
          <p className="text-sm text-slate-500">
            Send proposals to leads, track status, and close deals.
          </p>
        </div>
        <Button onClick={() => navigate('/quotations/create')}>+ New quotation</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by code or customer…"
            defaultValue={params.search}
            onSearch={onSearch}
          />
        </div>
        <select
          value={params.status || ''}
          onChange={onStatusChange}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All statuses</option>
          {QUOTATION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <QuotationTable
        quotations={data.quotations}
        loading={loading}
        error={error}
        onDelete={(q) => setDeleteTarget(q)}
        emptyAction={<Button onClick={() => navigate('/quotations/create')}>+ Create your first quotation</Button>}
      />

      <Pagination
        page={data.pagination?.page || 1}
        totalPages={data.pagination?.totalPages || 1}
        total={data.pagination?.total || 0}
        onPageChange={onPageChange}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete quotation?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.quotationCode}". This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
