import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', display_name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface-50 to-primary-100 dark:from-surface-950 dark:via-primary-950/20 dark:to-surface-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4">
            <span className="text-2xl font-bold text-white">CF</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create your account</h1>
          <p className="text-surface-500 mt-1">Start collaborating with your team</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Username</label>
            <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="input-field" placeholder="johndoe" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Display Name</label>
            <input type="text" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" placeholder="Min. 8 characters" required minLength={8} />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
