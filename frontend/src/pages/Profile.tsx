import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(formData);
      await fetchProfile();
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-card p-8 text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-3xl mx-auto">
            {user?.display_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mt-4">{user?.display_name || user?.username}</h1>
        <p className="text-surface-500">{user?.email}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
            {user?.is_verified ? 'Verified' : 'Unverified'}
          </span>
          <span className="badge-primary capitalize">{user?.role}</span>
          <span className={`badge ${user?.status === 'online' ? 'badge-success' : 'badge'}`}>
            {user?.status}
          </span>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Profile Information</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Edit Profile</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm gap-1">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Username</label>
            <input type="text" value={user?.username || ''} className="input-field bg-surface-100 dark:bg-surface-800 cursor-not-allowed" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
            <input type="email" value={user?.email || ''} className="input-field bg-surface-100 dark:bg-surface-800 cursor-not-allowed" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="input-field"
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              disabled={!editing}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input-field"
              rows={3}
              disabled={!editing}
              placeholder="Tell us about yourself"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Account Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-surface-500">Storage Used</p>
            <p className="text-lg font-semibold text-surface-900 dark:text-white">
              {user?.storage_used ? (user.storage_used / 1073741824).toFixed(2) : '0'} GB
            </p>
          </div>
          <div>
            <p className="text-xs text-surface-500">Storage Limit</p>
            <p className="text-lg font-semibold text-surface-900 dark:text-white">
              {user?.storage_limit ? (user.storage_limit / 1073741824).toFixed(2) : '1'} GB
            </p>
          </div>
          <div>
            <p className="text-xs text-surface-500">Teams</p>
            <p className="text-lg font-semibold text-surface-900 dark:text-white">{user?.team_count || 0}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500">Projects</p>
            <p className="text-lg font-semibold text-surface-900 dark:text-white">{user?.project_count || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
