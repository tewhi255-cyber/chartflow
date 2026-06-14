import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Shield, Users, Trash2, Activity, BarChart3, AlertTriangle, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs'>('overview');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, usersRes] = await Promise.all([
          adminAPI.getDashboard(), adminAPI.getUsers({ limit: 10 })
        ]);
        setStats(dashRes.data.data);
        setUsers(usersRes.data.data.users);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const { data } = await adminAPI.getLogs({ limit: 50 });
      setLogs(data.data?.logs || data.data || []);
    } catch {}
    setLogsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'logs' && logs.length === 0) {
      fetchLogs();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {}
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted');
    } catch {}
  };

  const filteredLogs = logs.filter((log: any) =>
    log.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.description?.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.username?.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Panel</h1>
          <p className="text-surface-500">System administration and monitoring</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-surface-200 dark:border-surface-800 pb-2 overflow-x-auto">
        {(['overview', 'users', 'logs'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`btn-ghost capitalize flex-shrink-0 ${activeTab === tab ? 'bg-surface-100 dark:bg-surface-800 text-primary-600' : ''}`}>
            {tab === 'overview' && <BarChart3 size={16} className="mr-1.5" />}
            {tab === 'users' && <Users size={16} className="mr-1.5" />}
            {tab === 'logs' && <Activity size={16} className="mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5">
              <p className="text-sm text-surface-500">Total Users</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.stats.users?.total || 0}</p>
              <p className="text-xs text-emerald-500 mt-1">+{stats.stats.users?.new_this_week || 0} this week</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-surface-500">Teams</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.stats.teams?.total || 0}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-surface-500">Projects</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.stats.projects?.total || 0}</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-sm text-surface-500">Total Tasks</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.stats.tasks?.total || 0}</p>
              <p className="text-xs text-emerald-500 mt-1">{stats.stats.tasks?.completed || 0} completed</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h2>
            {stats.recentActivity?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentActivity.slice(0, 10).map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm py-2">
                    <Activity size={14} className="text-surface-400" />
                    <span className="text-surface-600 dark:text-surface-400">
                      <strong className="text-surface-900 dark:text-white">{log.display_name || log.username}</strong> {log.description || log.action}
                    </span>
                    <span className="text-xs text-surface-400 ml-auto">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-400 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-semibold">
                        {u.display_name?.charAt(0)?.toUpperCase() || u.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-surface-900 dark:text-white">{u.display_name || u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="text-xs bg-transparent border border-surface-200 dark:border-surface-700 rounded-lg px-2 py-1 cursor-pointer">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${u.is_verified ? 'badge-success' : 'badge-warning'}`}>{u.is_verified ? 'Verified' : 'Unverified'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteUser(u.id)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">System Logs</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="input-field pl-9 py-1.5 text-sm w-64"
              />
            </div>
          </div>

          {logsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-sm">
                  <Clock size={14} className="text-surface-400 flex-shrink-0" />
                  <span className="text-surface-500 text-xs flex-shrink-0">{new Date(log.created_at).toLocaleString()}</span>
                  <span className="text-surface-600 dark:text-surface-400">
                    <strong className="text-surface-900 dark:text-white">{log.display_name || log.username || 'System'}</strong>
                    {' '}{log.description || log.action}
                  </span>
                  {log.ip_address && (
                    <span className="text-xs text-surface-400 ml-auto font-mono">{log.ip_address}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity size={40} className="mx-auto mb-3 text-surface-300" />
              <p className="text-surface-400 text-sm">{logSearch ? 'No logs match your search' : 'No system logs available'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
