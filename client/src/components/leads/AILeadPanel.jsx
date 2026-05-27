import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import aiService, { FOLLOW_UP_PURPOSES } from '../../services/ai.service';

function Section({ title, description, children, action }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function AILeadPanel({ lead, onLeadUpdated }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const [purpose, setPurpose] = useState('First contact');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // Reset draft when switching leads.
    setMessage('');
    setIsFallback(false);
    setGenError(null);
    setDirty(false);
  }, [lead?._id]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const { lead: updated, analysis } = await aiService.analyzeLead(lead._id);
      onLeadUpdated?.(updated);
      toast.success(`Analyzed: ${analysis.score} (${analysis.points}/100)`);
    } catch (err) {
      const m = err?.response?.data?.message || 'Failed to analyze lead';
      setAnalyzeError(m);
      toast.error(m);
    } finally {
      setAnalyzing(false);
    }
  }

  function lastNoteBody(currentLead) {
    if (!currentLead?.notes?.length) return '';
    const sorted = [...currentLead.notes].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted[0]?.body || '';
  }

  async function handleGenerate(regenerate = false) {
    setGenerating(true);
    setGenError(null);
    try {
      const payload = {
        customerName: lead.customerName,
        leadStatus: lead.status,
        needDescription: lead.needDescription || undefined,
        budget: Number.isFinite(Number(lead.budget)) ? Number(lead.budget) : undefined,
        lastNote: lastNoteBody(lead) || undefined,
        quotationStatus: undefined,
        followUpPurpose: purpose,
      };
      const result = await aiService.generateFollowUpMessage(payload);
      setMessage(result.message || '');
      setIsFallback(!!result.fallback);
      setDirty(false);
      if (result.fallback) {
        toast(`${regenerate ? 'Regenerated' : 'Generated'} (fallback)`, { icon: '⚠️' });
      } else {
        toast.success(regenerate ? 'Message regenerated' : 'Message generated');
      }
    } catch (err) {
      const m = err?.response?.data?.message || 'Failed to generate message';
      setGenError(m);
      toast.error(m);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!message) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
      } else {
        const ta = document.createElement('textarea');
        ta.value = message;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  }

  return (
    <div className="space-y-5">
      <Section
        title="AI lead analysis"
        description="Rule-based scoring uses budget, timeline, need, status, source, and note activity."
        action={
          <Button onClick={handleAnalyze} loading={analyzing}>
            {lead.leadScore ? 'Re-analyze' : 'Analyze lead'}
          </Button>
        }
      >
        {analyzing && <LoadingSpinner label="Analyzing…" />}

        {!analyzing && analyzeError && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
            {analyzeError}
          </div>
        )}

        {!analyzing && !analyzeError && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Score
              </span>
              {lead.leadScore ? (
                <Badge value={lead.leadScore} type="score" />
              ) : (
                <span className="text-sm text-slate-500">Not analyzed yet.</span>
              )}
            </div>
            {lead.scoreReason && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Reason
                </div>
                <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">{lead.scoreReason}</p>
              </div>
            )}
            {lead.suggestedAction && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Suggested action
                </div>
                <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                  {lead.suggestedAction}
                </p>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section
        title="Follow-up message generator"
        description="Generates a professional Vietnamese sales follow-up message tailored to the lead."
      >
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
          <label className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Follow-up purpose
            </span>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {FOLLOW_UP_PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <Button onClick={() => handleGenerate(false)} loading={generating}>
            Generate
          </Button>
        </div>

        {generating && <LoadingSpinner label="Generating…" />}

        {!generating && genError && (
          <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-3">
            {genError}
          </div>
        )}

        {!generating && !genError && message && (
          <div className="space-y-3">
            {isFallback && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Showing fallback message — template generation didn&apos;t produce a tailored result.
              </div>
            )}
            <textarea
              rows={8}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setDirty(true);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 whitespace-pre-wrap"
            />
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <span className="text-xs text-slate-500 mr-auto">
                {dirty ? 'Edited locally' : 'Generated draft'}
              </span>
              <Button variant="secondary" onClick={handleCopy} disabled={!message}>
                Copy
              </Button>
              <Button variant="secondary" onClick={() => handleGenerate(true)} loading={generating}>
                Regenerate
              </Button>
            </div>
          </div>
        )}

        {!generating && !message && !genError && (
          <p className="text-sm text-slate-500">
            Pick a purpose and press <em>Generate</em> to draft a Vietnamese follow-up message.
          </p>
        )}
      </Section>
    </div>
  );
}
