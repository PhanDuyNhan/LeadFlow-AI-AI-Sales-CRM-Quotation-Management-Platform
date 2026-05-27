import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import QuotationForm from '../components/quotations/QuotationForm';
import quotationService from '../services/quotation.service';

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultLeadId = searchParams.get('lead') || '';

  async function handleSubmit(payload) {
    try {
      const quotation = await quotationService.createQuotation(payload);
      toast.success('Quotation created');
      navigate(`/quotations/${quotation._id}`);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create quotation';
      toast.error(message);
      throw err;
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">
      <div>
        <button
          type="button"
          onClick={() => navigate('/quotations')}
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          ← Back to quotations
        </button>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">New quotation</h1>
        <p className="text-sm text-slate-500">
          Link to a lead, add line items, and totals will calculate automatically.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <QuotationForm
          mode="create"
          defaultLeadId={defaultLeadId}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/quotations')}
        />
      </div>
    </div>
  );
}
