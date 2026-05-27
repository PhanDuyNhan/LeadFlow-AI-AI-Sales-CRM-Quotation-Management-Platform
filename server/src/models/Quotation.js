const mongoose = require('mongoose');

const QUOTATION_STATUSES = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

const quotationItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Item name is required'], trim: true },
    description: { type: String, trim: true },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: true }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationCode: {
      type: String,
      required: [true, 'Quotation code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'A quotation must be linked to a lead'],
    },
    customerName: { type: String, trim: true },
    items: {
      type: [quotationItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'A quotation must contain at least one item',
      },
    },
    subtotal: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: [0, 'Discount cannot be negative'], default: 0 },
    tax: { type: Number, min: [0, 'Tax cannot be negative'], default: 0 },
    totalAmount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: QUOTATION_STATUSES, default: 'Draft' },
    validUntil: { type: Date, default: null },
    notes: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

quotationSchema.index({ lead: 1 });
quotationSchema.index({ createdBy: 1, status: 1 });

function recomputeTotals(doc) {
  let subtotal = 0;
  (doc.items || []).forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const total = +(qty * price).toFixed(2);
    item.totalPrice = total;
    subtotal += total;
  });
  doc.subtotal = +subtotal.toFixed(2);
  const discount = Number(doc.discount) || 0;
  const tax = Number(doc.tax) || 0;
  const total = doc.subtotal - discount + tax;
  doc.totalAmount = +Math.max(0, total).toFixed(2);
}

// Mongoose 9 no longer passes a `next` callback to document middleware —
// async hooks resolve when the returned promise settles (see User.js for the
// same pattern). Mutate the document in place and return.
quotationSchema.pre('validate', function syncTotals() {
  recomputeTotals(this);
});

quotationSchema.statics.QUOTATION_STATUSES = QUOTATION_STATUSES;
quotationSchema.statics.recomputeTotals = recomputeTotals;

module.exports = mongoose.model('Quotation', quotationSchema);
module.exports.QUOTATION_STATUSES = QUOTATION_STATUSES;
