import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import taskService from '../services/task.service';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import TaskModal from '../components/tasks/TaskModal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'all', label: 'All tasks' },
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('today');

  const [today, setToday] = useState({ tasks: [], leads: [] });
  const [overdue, setOverdue] = useState({ tasks: [] });
  const [all, setAll] = useState({ tasks: [], pagination: null });

  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const searchTimerRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayData, overdueData, allData] = await Promise.all([
        taskService.getTodayFollowUps(),
        taskService.getOverdueFollowUps(),
        taskService.listTasks({
          status: filters.status || undefined,
          priority: filters.priority || undefined,
          search: filters.search || undefined,
          limit: 50,
        }),
      ]);
      setToday(todayData || { tasks: [], leads: [] });
      setOverdue(overdueData || { tasks: [] });
      setAll(allData || { tasks: [], pagination: null });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load tasks';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, filters.search]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const counts = useMemo(
    () => ({
      today: today.tasks?.length || 0,
      overdue: overdue.tasks?.length || 0,
      all: all.tasks?.length || 0,
      followUpLeads: today.leads?.length || 0,
    }),
    [today, overdue, all]
  );

  async function handleCreate(payload) {
    try {
      await taskService.createTask(payload);
      toast.success('Task created');
      setCreateOpen(false);
      await loadAll();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create task';
      toast.error(message);
      throw err;
    }
  }

  async function handleEdit(payload) {
    if (!editTarget) return;
    try {
      await taskService.updateTask(editTarget._id, payload);
      toast.success('Task updated');
      setEditTarget(null);
      await loadAll();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update task';
      toast.error(message);
      throw err;
    }
  }

  async function handleComplete(task) {
    setCompletingId(task._id);
    try {
      await taskService.completeTask(task._id);
      toast.success('Task completed');
      await loadAll();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to complete task';
      toast.error(message);
    } finally {
      setCompletingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget._id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete task';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  function renderActiveTab() {
    if (activeTab === 'today') {
      return (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Tasks due today
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-medium text-blue-700">
                {counts.today}
              </span>
            </h2>
            <TaskList
              tasks={today.tasks}
              loading={loading}
              error={error}
              emptyTitle="Nothing due today"
              emptyMessage="You're all caught up! Create a task to plan ahead."
              emptyAction={<Button onClick={() => setCreateOpen(true)}>+ New task</Button>}
              onComplete={handleComplete}
              onEdit={(t) => setEditTarget(t)}
              onDelete={(t) => setDeleteTarget(t)}
              completingId={completingId}
            />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Leads to follow up today
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-100 px-1.5 text-xs font-medium text-indigo-700">
                {counts.followUpLeads}
              </span>
            </h2>
            {today.leads && today.leads.length > 0 ? (
              <ul className="space-y-2">
                {today.leads.map((lead) => (
                  <li
                    key={lead._id}
                    className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/leads/${lead._id}`}
                          className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                          {lead.customerName}
                        </Link>
                        <Badge value={lead.status} type="status" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lead.phone} • Next follow-up: {formatDate(lead.nextFollowUpDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No leads scheduled for follow-up today.</p>
            )}
          </section>
        </div>
      );
    }

    if (activeTab === 'overdue') {
      return (
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Overdue tasks
            <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-100 px-1.5 text-xs font-medium text-rose-700">
              {counts.overdue}
            </span>
          </h2>
          <TaskList
            tasks={overdue.tasks}
            loading={loading}
            error={error}
            emptyTitle="No overdue tasks"
            emptyMessage="Nothing past its due date."
            onComplete={handleComplete}
            onEdit={(t) => setEditTarget(t)}
            onDelete={(t) => setDeleteTarget(t)}
            completingId={completingId}
          />
        </section>
      );
    }

    return (
      <section>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search title or description…"
            defaultValue={filters.search}
            onChange={(e) => {
              const v = e.target.value;
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => {
                setFilters((f) => ({ ...f, search: v }));
              }, 300);
            }}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <TaskList
          tasks={all.tasks}
          loading={loading}
          error={error}
          emptyTitle="No tasks"
          emptyMessage="No tasks match your filters."
          emptyAction={
            <Button onClick={() => setCreateOpen(true)}>+ Create your first task</Button>
          }
          onComplete={handleComplete}
          onEdit={(t) => setEditTarget(t)}
          onDelete={(t) => setDeleteTarget(t)}
          completingId={completingId}
        />
      </section>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Follow-up tasks</h1>
          <p className="text-sm text-slate-500">
            Keep track of what to do today, what's overdue, and everything in between.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New task</Button>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count =
            tab.key === 'today'
              ? counts.today
              : tab.key === 'overdue'
              ? counts.overdue
              : counts.all;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition ${
                isActive
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab.label}
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-medium text-slate-600">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {renderActiveTab()}

      <TaskModal
        isOpen={createOpen}
        title="Create task"
        onClose={() => setCreateOpen(false)}
      >
        <TaskForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </TaskModal>

      <TaskModal
        isOpen={!!editTarget}
        title="Edit task"
        onClose={() => setEditTarget(null)}
      >
        {editTarget && (
          <TaskForm
            mode="edit"
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </TaskModal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete task?"
        message={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}". This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  );
}
