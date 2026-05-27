const mongoose = require('mongoose');

const TASK_PRIORITIES = ['Low', 'Medium', 'High'];
const TASK_STATUSES = ['Pending', 'Completed', 'Overdue'];

const taskSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title is required'],
    },
    description: { type: String, trim: true },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'Medium',
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'Pending',
    },
    completedAt: { type: Date, default: null },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ createdBy: 1, status: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ lead: 1 });

taskSchema.statics.TASK_PRIORITIES = TASK_PRIORITIES;
taskSchema.statics.TASK_STATUSES = TASK_STATUSES;

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_PRIORITIES = TASK_PRIORITIES;
module.exports.TASK_STATUSES = TASK_STATUSES;
