import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboard.service';
import MetricCard from '../components/dashboard/MetricCard';
import ChartCard from '../components/dashboard/ChartCard';
import LeadByStatusChart from '../components/dashboard/charts/LeadByStatusChart';
import LeadBySourceChart from '../components/dashboard/charts/LeadBySourceChart';
import QuotationStatusChart from '../components/dashboard/charts/QuotationStatusChart';
import RevenueForecastChart from '../components/dashboard/charts/RevenueForecastChart';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

function Section({ title, action, children, className = '' }) {
  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboard();
      setData(result);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <LoadingSpinner label="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-rose-200 rounded-xl p-6 text-center">
          <p className="text-sm text-rose-700">{error}</p>
          <div className="mt-4 flex justify-center">
            <Button onClick={load}>Try again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, charts, topHotLeads, todayFollowUps, overdueFollowUps } = data;
  const noData =
    summary.totalLeads === 0 && summary.totalQuotations === 0 && summary.followUpsToday === 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Welcome{user ? `, ${user.name}` : ''}. Here's how your pipeline is looking
            {user?.role === 'admin' ? ' across the team' : ''}.
          </p>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      {noData ? (
        <EmptyState
          title="No data yet"
          message="Create your first lead, then add a quotation or follow-up task to see metrics here."
          action={
            <div className="flex gap-2">
              <Link to="/leads/create">
                <Button>+ New lead</Button>
              </Link>
              <Link to="/quotations/create">
                <Button variant="secondary">+ New quotation</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard title="Total leads" value={summary.totalLeads} color="indigo" icon="L" />
            <MetricCard title="New leads" value={summary.newLeads} color="slate" icon="N" />
            <MetricCard title="Hot leads" value={summary.hotLeads} color="rose" icon="H" />
            <MetricCard title="Warm leads" value={summary.warmLeads} color="amber" icon="W" />
            <MetricCard title="Cold leads" value={summary.coldLeads} color="sky" icon="C" />
            <MetricCard
              title="Total quotations"
              value={summary.totalQuotations}
              color="violet"
              icon="Q"
            />
            <MetricCard
              title="Sent quotations"
              value={summary.sentQuotations}
              color="blue"
              icon="S"
            />
            <MetricCard
              title="Accepted"
              value={summary.acceptedQuotations}
              color="emerald"
              icon="A"
            />
            <MetricCard
              title="Estimated revenue"
              value={formatCurrency(summary.estimatedRevenue)}
              hint="Sent + Accepted quotations"
              color="emerald"
              icon="$"
            />
            <MetricCard
              title="Conversion rate"
              value={`${summary.conversionRate}%`}
              hint={`${summary.wonLeads} won / ${summary.totalLeads} leads`}
              color="indigo"
              icon="%"
            />
            <MetricCard
              title="Follow-ups today"
              value={summary.followUpsToday}
              hint={`${summary.followUpTasksToday} tasks · ${summary.followUpLeadsToday} leads`}
              color="blue"
              icon="T"
            />
            <MetricCard
              title="Overdue follow-ups"
              value={summary.overdueFollowUps}
              color="rose"
              icon="!"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Leads by status"
              subtitle="Where your pipeline sits today"
              isEmpty={!charts.leadByStatus?.some((d) => d.count > 0)}
            >
              <LeadByStatusChart data={charts.leadByStatus} />
            </ChartCard>

            <ChartCard
              title="Leads by source"
              subtitle="Where your leads are coming from"
              isEmpty={!charts.leadBySource?.length}
            >
              <LeadBySourceChart data={charts.leadBySource} />
            </ChartCard>

            <ChartCard
              title="Quotations by status"
              subtitle="Open vs closed proposals"
              isEmpty={!charts.quotationByStatus?.some((d) => d.count > 0)}
            >
              <QuotationStatusChart data={charts.quotationByStatus} />
            </ChartCard>

            <ChartCard
              title="Revenue forecast"
              subtitle="Last 6 months of sent + accepted quotations"
              isEmpty={!charts.revenueForecast?.some((d) => (d.sent || 0) + (d.accepted || 0) > 0)}
            >
              <RevenueForecastChart data={charts.revenueForecast} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section
              title="Follow-ups today"
              action={
                <Link to="/tasks" className="text-xs text-indigo-600 hover:underline">
                  View all
                </Link>
              }
            >
              {todayFollowUps.tasks?.length || todayFollowUps.leads?.length ? (
                <div className="space-y-3">
                  {todayFollowUps.tasks?.length > 0 && (
                    <ul className="space-y-2">
                      {todayFollowUps.tasks.map((task) => (
                        <li
                          key={task._id}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-slate-800 truncate">
                              {task.title}
                            </span>
                            <Badge value={task.priority} type="priority" />
                          </div>
                          {task.lead && (
                            <p className="text-xs text-slate-500 mt-1">
                              Lead:{' '}
                              <Link
                                to={`/leads/${task.lead._id || task.lead}`}
                                className="text-indigo-600 hover:underline"
                              >
                                {task.lead.customerName || 'View'}
                              </Link>
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {todayFollowUps.leads?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                        Leads to follow up
                      </p>
                      <ul className="space-y-2">
                        {todayFollowUps.leads.map((lead) => (
                          <li
                            key={lead._id}
                            className="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <Link
                                to={`/leads/${lead._id}`}
                                className="text-sm font-medium text-indigo-600 hover:underline"
                              >
                                {lead.customerName}
                              </Link>
                              <p className="text-xs text-slate-500 mt-0.5">{lead.phone}</p>
                            </div>
                            <Badge value={lead.status} type="status" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nothing scheduled for today.</p>
              )}
            </Section>

            <Section
              title="Overdue follow-ups"
              action={
                <Link to="/tasks" className="text-xs text-indigo-600 hover:underline">
                  View all
                </Link>
              }
            >
              {overdueFollowUps.tasks?.length ? (
                <ul className="space-y-2">
                  {overdueFollowUps.tasks.map((task) => (
                    <li key={task._id} className="rounded-lg border border-rose-200 bg-rose-50/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {task.title}
                        </span>
                        <Badge value={task.status} type="taskStatus" />
                      </div>
                      <p className="text-xs text-rose-600 mt-1">
                        Due {formatDate(task.dueDate)}
                        {task.lead && (
                          <>
                            {' · Lead: '}
                            <Link
                              to={`/leads/${task.lead._id || task.lead}`}
                              className="text-indigo-600 hover:underline"
                            >
                              {task.lead.customerName || 'View'}
                            </Link>
                          </>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Nothing overdue. Nice work.</p>
              )}
            </Section>
          </div>

          <Section
            title="Top hot leads"
            action={
              <Link to="/leads" className="text-xs text-indigo-600 hover:underline">
                View all leads
              </Link>
            }
          >
            {topHotLeads?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Phone</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Budget</th>
                      <th className="py-2 pr-3">Next follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHotLeads.map((lead) => (
                      <tr key={lead._id} className="border-t border-slate-100">
                        <td className="py-2 pr-3">
                          <Link
                            to={`/leads/${lead._id}`}
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            {lead.customerName}
                          </Link>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">{lead.phone}</td>
                        <td className="py-2 pr-3">
                          <Badge value={lead.status} type="status" />
                        </td>
                        <td className="py-2 pr-3 text-slate-800">{formatCurrency(lead.budget)}</td>
                        <td className="py-2 pr-3 text-slate-600">
                          {formatDate(lead.nextFollowUpDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hot leads yet — run "Analyze Lead" on a lead to score it.</p>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
