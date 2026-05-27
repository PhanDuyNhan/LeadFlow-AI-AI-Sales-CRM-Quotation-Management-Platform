import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useLeads from '../hooks/useLeads';
import LeadTable from '../components/leads/LeadTable';
import LeadFilters from '../components/leads/LeadFilters';
import SearchInput from '../components/common/SearchInput';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import leadService from '../services/lead.service';

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  status: undefined,
  source: undefined,
  leadScore: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function LeadsPage() {
  const navigate = useNavigate();
  const { leads, pagination, loading, error, params, setParams, refresh } = useLeads(DEFAULT_PARAMS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filters = useMemo(
    () => ({
      status: params.status,
      source: params.source,
      leadScore: params.leadScore,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    [params]
  );

  const onSearch = useCallback((value) => {
    setParams((prev) => ({ ...prev, page: 1, search: value || '' }));
  }, [setParams]);

  const onFilterChange = useCallback((next) => {
    setParams((prev) => ({ ...prev, page: 1, ...next }));
  }, [setParams]);

  const onPageChange = useCallback((page) => {
    setParams((prev) => ({ ...prev, page }));
  }, [setParams]);

  const onReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
  }, [setParams]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await leadService.deleteLead(deleteTarget._id);
      toast.success(`${deleteTarget.customerName} deleted`);
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
          <p className="text-sm text-slate-500">Manage prospects, track status, and follow up on opportunities.</p>
        </div>
        <Button onClick={() => navigate('/leads/create')}>+ New lead</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by name, phone, email, or company…"
            defaultValue={params.search}
            onSearch={onSearch}
          />
        </div>
      </div>

      <LeadFilters filters={filters} onChange={onFilterChange} onReset={onReset} />

      <LeadTable
        leads={leads}
        loading={loading}
        error={error}
        onDelete={(lead) => setDeleteTarget(lead)}
        emptyAction={<Button onClick={() => navigate('/leads/create')}>+ Create your first lead</Button>}
      />

      <Pagination
        page={pagination?.page || 1}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || 0}
        onPageChange={onPageChange}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete lead?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.customerName}". This cannot be undone.`
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
