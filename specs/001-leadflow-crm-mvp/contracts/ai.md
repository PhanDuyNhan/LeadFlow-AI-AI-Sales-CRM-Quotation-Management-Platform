# API Contract: AI Features

**Base path**: `/api/ai`
**Auth**: Bearer token required for all endpoints

---

## POST /api/ai/score-lead/:leadId

Analyse a lead and return a Hot/Warm/Cold classification with rationale and
suggested next action.

**Rule-based scoring logic** (from `aiService.js`):
- **Hot**: status is `Negotiating` or `Quoted`, AND `budget >= 10000`; OR
  status is `Qualified`, AND `budget >= 50000`
- **Cold**: status is `New` AND `budget = 0`; OR status is `Lost`
- **Warm**: all other cases

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Lead analysed",
  "data": {
    "leadId": "64abc001...",
    "score": "Hot",
    "reason": "This lead is actively negotiating with a budget of $25,000, indicating strong purchase intent.",
    "suggestedAction": "Send a finalised proposal and schedule a decision meeting within 48 hours."
  }
}
```

**Response 404 — Lead Not Found**:
```json
{
  "success": false,
  "message": "Lead not found",
  "errors": []
}
```

**Response 500 — AI Service Error** (fallback):
```json
{
  "success": false,
  "message": "AI scoring is temporarily unavailable. Please try again later.",
  "errors": []
}
```

---

## POST /api/ai/follow-up-message/:leadId

Generate a professional follow-up message based on the lead's context.

**Template selection**: Status-aware template pool (see `research.md` §6).
One of 2–3 templates for the lead's current status is selected and
personalised with `customerName`.

**Response 200 — OK**:
```json
{
  "success": true,
  "message": "Follow-up message generated",
  "data": {
    "leadId": "64abc001...",
    "message": "Hi Nguyen Van A, I wanted to follow up on the proposal we discussed. I'm here to answer any questions and help you move forward. Would you like to schedule a brief review call this week?"
  }
}
```

**Response 404 — Lead Not Found**:
```json
{
  "success": false,
  "message": "Lead not found",
  "errors": []
}
```

**Response 500 — AI Service Error** (fallback):
```json
{
  "success": false,
  "message": "Message generation is temporarily unavailable. Here is a default message you can use: 'Hi [customer], I wanted to follow up on our recent conversation. Please feel free to reach out if you have any questions.'",
  "errors": []
}
```
