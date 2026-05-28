/**
 * LeadFlow AI — demo seed script.
 *
 * Creates two demo accounts and a small set of sample leads, quotations, and
 * tasks so the app has something to show on first run.
 *
 * Safety:
 *   - Idempotent by default: existing demo users are reused, and sample data is
 *     only created when the demo admin currently owns no leads. Re-running the
 *     script will NOT duplicate data and never deletes anything.
 *   - Pass `--reset` to remove the demo users and the data they own, then
 *     recreate everything from scratch. This only ever touches the two demo
 *     accounts — real user data is left untouched.
 *
 * The demo credentials below are intentional, public, throwaway logins for a
 * portfolio demo — they are NOT real secrets.
 *
 * Run from the `server/` directory:
 *   npm run seed
 *   npm run seed -- --reset
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Quotation = require('../models/Quotation');
const Task = require('../models/Task');

const RESET = process.argv.includes('--reset');

const DEMO_ADMIN = {
  name: 'Demo Admin',
  email: 'admin@leadflow.ai',
  password: 'admin123456',
  role: 'admin',
};

const DEMO_USER = {
  name: 'Demo User',
  email: 'user@leadflow.ai',
  password: 'user123456',
  role: 'user',
};

function daysFromNow(offset) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

async function ensureUser(spec) {
  const existing = await User.findOne({ email: spec.email });
  if (existing) {
    console.log(`  • user ${spec.email} already exists — reused`);
    return existing;
  }
  const created = await User.create(spec);
  console.log(`  • created ${spec.role} ${spec.email}`);
  return created;
}

async function seedSampleData(admin, user) {
  // Leads owned by the admin, spanning statuses / scores / sources.
  const leads = await Lead.create([
    {
      customerName: 'Acme Corporation',
      phone: '0901234567',
      email: 'buyer@acme.example',
      company: 'Acme Corp',
      source: 'Website',
      needDescription: 'Looking for an annual CRM subscription for 25 seats.',
      budget: 12000,
      timeline: 'This quarter',
      status: 'Negotiating',
      leadScore: 'Hot',
      scoreReason: 'High budget and active negotiation.',
      suggestedAction: 'Send a tailored quotation and schedule a call.',
      createdBy: admin._id,
      assignedTo: admin._id,
      nextFollowUpDate: daysFromNow(0),
    },
    {
      customerName: 'Bright Studio',
      phone: '0907654321',
      email: 'hello@brightstudio.example',
      company: 'Bright Studio',
      source: 'Referral',
      needDescription: 'Evaluating tools for a small sales team.',
      budget: 3000,
      timeline: 'Next month',
      status: 'Qualified',
      leadScore: 'Warm',
      createdBy: admin._id,
      assignedTo: admin._id,
    },
    {
      customerName: 'Walk-in Visitor',
      phone: '0912000111',
      source: 'Walk-in',
      budget: 0,
      status: 'New',
      leadScore: 'Cold',
      createdBy: admin._id,
    },
  ]);

  // One lead owned by the regular user — demonstrates role scoping.
  await Lead.create({
    customerName: 'Nguyen Trading',
    phone: '0938111222',
    company: 'Nguyen Trading Co.',
    source: 'Facebook',
    budget: 5000,
    status: 'Contacted',
    leadScore: 'Warm',
    createdBy: user._id,
    assignedTo: user._id,
  });

  const hotLead = leads[0];

  // Quotations linked to the admin's hot lead.
  await Quotation.create([
    {
      quotationCode: 'QT-DEMO-001',
      lead: hotLead._id,
      customerName: hotLead.customerName,
      items: [
        { name: 'CRM subscription (annual)', quantity: 25, unitPrice: 400 },
        { name: 'Onboarding & training', quantity: 1, unitPrice: 1500 },
      ],
      discount: 500,
      tax: 0,
      status: 'Sent',
      validUntil: daysFromNow(14),
      notes: 'Volume discount applied for 25 seats.',
      createdBy: admin._id,
    },
    {
      quotationCode: 'QT-DEMO-002',
      lead: hotLead._id,
      customerName: hotLead.customerName,
      items: [{ name: 'Pilot package (3 months)', quantity: 1, unitPrice: 1200 }],
      status: 'Draft',
      createdBy: admin._id,
    },
  ]);

  // Tasks: one due today, one overdue, one upcoming.
  await Task.create([
    {
      title: 'Call Acme to confirm seat count',
      description: 'Verify final headcount before sending the revised quote.',
      dueDate: daysFromNow(0),
      priority: 'High',
      status: 'Pending',
      lead: hotLead._id,
      createdBy: admin._id,
      assignedTo: admin._id,
    },
    {
      title: 'Follow up on Bright Studio proposal',
      dueDate: daysFromNow(-2),
      priority: 'Medium',
      status: 'Pending',
      lead: leads[1]._id,
      createdBy: admin._id,
    },
    {
      title: 'Prepare onboarding checklist',
      dueDate: daysFromNow(5),
      priority: 'Low',
      status: 'Pending',
      createdBy: admin._id,
    },
  ]);

  console.log('  • created 4 leads, 2 quotations, 3 tasks');
}

async function resetDemoData(admin, user) {
  const ownerIds = [admin._id, user._id];
  const leadIds = (await Lead.find({ createdBy: { $in: ownerIds } }).select('_id')).map((l) => l._id);
  await Quotation.deleteMany({
    $or: [{ createdBy: { $in: ownerIds } }, { lead: { $in: leadIds } }],
  });
  await Task.deleteMany({ createdBy: { $in: ownerIds } });
  await Lead.deleteMany({ createdBy: { $in: ownerIds } });
  console.log('  • removed existing demo-owned leads, quotations, and tasks');
}

async function run() {
  await connectDB();
  console.log('[seed] Connected. Seeding demo data…');

  const admin = await ensureUser(DEMO_ADMIN);
  const user = await ensureUser(DEMO_USER);

  if (RESET) {
    await resetDemoData(admin, user);
  }

  const existingLeadCount = await Lead.countDocuments({ createdBy: admin._id });
  if (existingLeadCount > 0 && !RESET) {
    console.log('  • demo admin already has leads — skipping sample data (run with --reset to rebuild)');
  } else {
    await seedSampleData(admin, user);
  }

  console.log('\n[seed] Done. Demo logins:');
  console.log(`  admin → ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
  console.log(`  user  → ${DEMO_USER.email} / ${DEMO_USER.password}`);
}

run()
  .catch((err) => {
    console.error('[seed] Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
