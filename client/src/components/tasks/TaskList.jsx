import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

function TaskRow({ task, onComplete, onEdit, onDelete, completingId }) {
  const isCompleted = task.status === 'Completed';
  const isCompleting = completingId === task._id;
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4
            className={`text-sm font-semibold ${
              isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {task.title}
          </h4>
          <Badge value={task.status} type="taskStatus" />
          <Badge value={task.priority} type="priority" />
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{task.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Due: {formatDate(task.dueDate)}</span>
          {task.lead && (
            <span>
              Lead:{' '}
              <Link
                to={`/leads/${task.lead._id || task.lead}`}
                className="text-indigo-600 hover:underline"
              >
                {task.lead.customerName || 'View'}
              </Link>
            </span>
          )}
          {task.assignedTo && <span>Assigned: {task.assignedTo.name || '—'}</span>}
          {task.createdBy && <span>Created by: {task.createdBy.name || '—'}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
        {!isCompleted && (
          <Button
            variant="primary"
            onClick={() => onComplete(task)}
            loading={isCompleting}
          >
            Mark complete
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => onDelete(task)}>
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}

export default function TaskList({
  tasks,
  loading,
  error,
  emptyTitle = 'No tasks',
  emptyMessage,
  emptyAction,
  onComplete,
  onEdit,
  onDelete,
  completingId,
}) {
  if (loading) {
    return <LoadingSpinner label="Loading tasks…" />;
  }
  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }
  if (!tasks || tasks.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }
  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskRow
          key={task._id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          completingId={completingId}
        />
      ))}
    </ul>
  );
}
