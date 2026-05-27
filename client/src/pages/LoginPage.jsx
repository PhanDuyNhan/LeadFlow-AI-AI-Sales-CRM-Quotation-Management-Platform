import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  async function onSubmit(values) {
    try {
      const session = await authService.login(values);
      login(session);
      toast.success(`Welcome back, ${session.user.name}`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Login failed. Check your email and password.';
      toast.error(message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Log in to your LeadFlow workspace.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('email')}
            />
            {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-rose-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full">
            Log in
          </Button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
