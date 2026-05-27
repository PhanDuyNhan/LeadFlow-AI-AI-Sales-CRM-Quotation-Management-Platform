import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-bold text-slate-800">404</h1>
        <p className="text-slate-600">Page not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
