import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import LeadsPage from '../pages/LeadsPage';
import LeadCreatePage from '../pages/LeadCreatePage';
import LeadDetailPage from '../pages/LeadDetailPage';
import QuotationsPage from '../pages/QuotationsPage';
import QuotationCreatePage from '../pages/QuotationCreatePage';
import QuotationDetailPage from '../pages/QuotationDetailPage';
import TasksPage from '../pages/TasksPage';
import NotFoundPage from '../pages/NotFoundPage';
import PrivateRoute from './PrivateRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import AppLayout from '../layouts/AppLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/create" element={<LeadCreatePage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="/quotations/create" element={<QuotationCreatePage />} />
          <Route path="/quotations/:id" element={<QuotationDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
