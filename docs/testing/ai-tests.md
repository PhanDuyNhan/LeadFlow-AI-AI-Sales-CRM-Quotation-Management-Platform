# Manual Test Checklist — AI Lead Intelligence

The AI is a deterministic, rule-based engine (`server/src/services/aiService.js`).
Scoring: total points are clamped 0–100; **Hot ≥ 60**, **Cold < 30**, otherwise
**Warm**. A lead with `status: Lost` is always **Cold**.

## Lead scoring — `POST /leads/:id/analyze`

- [ ] **Hot** — lead with `status: Negotiating`, `budget: 50000`
      (25 + 40 = 65) → returns `leadScore: "Hot"` with a `reason` and `suggestedAction`.
- [ ] **Hot** — `status: Qualified`, `budget: 15000`, `source: Referral`
      (25 + 25 + 10 = 60) → `Hot`.
- [ ] **Warm** — `status: Contacted`, `budget: 15000` (10 + 25 = 35) → `Warm`.
- [ ] **Cold** — `status: New`, `budget: 0` (0 points) → `Cold`.
- [ ] **Cold** — any lead with `status: Lost` → `Cold` regardless of other fields.
- [ ] The endpoint persists `leadScore`, `scoreReason`, and `suggestedAction` on the lead.
- [ ] Re-analyzing the same unchanged lead returns the **same** score (deterministic).

## Follow-up messages — `POST /ai/follow-up-message`

- [ ] `GET /ai/follow-up-purposes` returns the 6 purposes (First contact, After
      quotation, Payment reminder, Meeting reminder, Re-engagement, Thank you message).
- [ ] A valid `followUpPurpose` + `customerName` → returns a non-empty `message`
      that includes the customer name, with `fallback: false`.
- [ ] An invalid `followUpPurpose` → `400` validation error.
- [ ] Omitting optional fields (budget, need, note) still returns a coherent message.

## UI (Lead detail → AI panel)

- [ ] "Analyze Lead" shows a spinner, then a score badge + reason + suggested action.
- [ ] "Generate Follow-up Message" fills an editable textarea; "Regenerate" produces another;
      "Copy" copies to clipboard with a toast.
- [ ] If generation falls back, a fallback banner is shown but a usable message still appears.
