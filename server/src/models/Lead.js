const mongoose = require('mongoose');

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Quoted', 'Negotiating', 'Won', 'Lost'];
const LEAD_SOURCES = ['Website', 'Facebook', 'Zalo', 'Referral', 'Walk-in', 'Event', 'Other'];
const LEAD_SCORES = ['Hot', 'Warm', 'Cold'];

const leadNoteSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [1, 'Customer name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    source: { type: String, enum: LEAD_SOURCES },
    needDescription: { type: String, trim: true },
    budget: { type: Number, min: [0, 'Budget must be a non-negative number'], default: 0 },
    timeline: { type: String, trim: true },
    status: { type: String, enum: LEAD_STATUSES, default: 'New' },
    leadScore: { type: String, enum: LEAD_SCORES, default: null },
    scoreReason: { type: String, trim: true },
    suggestedAction: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: { type: [leadNoteSchema], default: [] },
    nextFollowUpDate: { type: Date, default: null },
  },
  { timestamps: true }
);

leadSchema.index({ createdBy: 1, status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ customerName: 'text', phone: 'text', email: 'text', company: 'text' });

leadSchema.statics.LEAD_STATUSES = LEAD_STATUSES;
leadSchema.statics.LEAD_SOURCES = LEAD_SOURCES;
leadSchema.statics.LEAD_SCORES = LEAD_SCORES;

module.exports = mongoose.model('Lead', leadSchema);
module.exports.LEAD_STATUSES = LEAD_STATUSES;
module.exports.LEAD_SOURCES = LEAD_SOURCES;
module.exports.LEAD_SCORES = LEAD_SCORES;
