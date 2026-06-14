import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-surface-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-surface-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
