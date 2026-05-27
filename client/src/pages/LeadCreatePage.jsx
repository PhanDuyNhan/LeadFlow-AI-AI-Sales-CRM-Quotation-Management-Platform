import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadForm from '../components/leads/LeadForm';
import leadService from '../services/lead.service';

export default function LeadCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    try {
      const lead = await leadService.createLead(values);
      toast.success('Lead created');
      navigate(`/leads/${lead._id}`);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create lead';
      toast.error(message);
      throw err;
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <div>
        <button
          type="button"
          onClick={() => navigate('/leads')}
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          ← Back to leads
        </button>
        <h1 className="text-2xl font-bold text-slate-800 mt-2">New lead</h1>
        <p className="text-sm text-slate-500">
          Capture a prospect&apos;s details. They&apos;ll start in the &quot;New&quot; status.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <LeadForm mode="create" onSubmit={handleSubmit} onCancel={() => navigate('/leads')} />
      </div>
    </div>
  );
}
