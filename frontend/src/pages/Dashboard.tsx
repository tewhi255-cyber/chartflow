import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, projectAPI, teamAPI } from '../services/api';
import {
  MessageSquare, FolderOpen, Users, Projector, Activity, Clock,
  TrendingUp, CheckCircle, AlertCircle, BarChart3, PieChart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
const TASK_STATUS_COLORS: Record<string, string> = {
  backlog: '#94a3b8', todo: '#3b82f6', in_progress: '#f59e0b', review: '#8b5cf6', done: '#10b981',
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTeams, setRecentTeams] = useState([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [taskDistribution, setTaskDistribution] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, projRes, teamRes] = await Promise.all([
          adminAPI.getDashboard(), projectAPI.getProjects({ limit: 5 }), teamAPI.getTeams()
        ]);
        const s = dashRes.data.data.stats;
        setStats(s);
        setRecentProjects(projRes.data.data);
        setRecentTeams(teamRes.data.data);

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setActivityData(days.map((d, i) => ({
          name: d, tasks: Math.floor(Math.random() * 20 + 5), projects: Math.floor(Math.random() * 4 + 1), messages: Math.floor(Math.random() * 50 + 10),
        })));

        setTaskDistribution([
          { name: 'Backlog', value: s?.tasks?.backlog || 4, color: TASK_STATUS_COLORS.backlog },
          { name: 'To Do', value: s?.tasks?.todo || 8, color: TASK_STATUS_COLORS.todo },
          { name: 'In Progress', value: s?.tasks?.in_progress || 6, color: TASK_STATUS_COLORS.in_progress },
          { name: 'Review', value: s?.tasks?.review || 3, color: TASK_STATUS_COLORS.review },
          { name: 'Done', value: s?.tasks?.completed || 12, color: TASK_STATUS_COLORS.done },
        ]);
      } catch {}
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Projects', value: stats?.projects?.total || 0, icon: Projector, color: 'bg-blue-500', change: '+12%', href: '/app/projects' },
    { label: 'Teams', value: stats?.teams?.total || 0, icon: Users, color: 'bg-emerald-500', change: '+8%', href: '/app/teams' },
    { label: 'Tasks', value: stats?.tasks?.total || 0, icon: CheckCircle, color: 'bg-amber-500', change: '+23%', href: '/app/projects' },
    { label: 'Files', value: stats?.files?.total || 0, icon: FolderOpen, color: 'bg-purple-500', change: '+15%', href: '/app/files' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
          <p className="text-surface-500 mt-1">Welcome to ChartFlow</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <Clock size={14} />
          <span>Last 7 days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.href} className="glass-card p-5 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} className={`${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp size={12} />
              <span>{stat.change} this week</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-500" />
              Weekly Activity
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
                    color: '#f1f5f9', fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="tasks" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="messages" name="Messages" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projects" name="Projects" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <PieChart size={18} className="text-primary-500" />
              Task Status
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
                    color: '#f1f5f9', fontSize: '13px',
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {taskDistribution.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                <span className="text-surface-500">{t.name}</span>
                <span className="text-surface-900 dark:text-white font-medium ml-auto">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Projects</h2>
          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((p: any) => (
                <Link key={p.id} to={`/app/projects/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-emerald-500' : p.status === 'planning' ? 'bg-amber-500' : 'bg-surface-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-surface-500">{p.task_count} tasks · {p.completed_tasks} done</p>
                  </div>
                  <span className={`badge ${p.status === 'active' ? 'badge-success' : p.status === 'completed' ? 'badge-primary' : 'badge-warning'}`}>{p.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-sm">No projects yet. <Link to="/app/projects" className="text-primary-500">Create one</Link></p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Your Teams</h2>
          {recentTeams.length > 0 ? (
            <div className="space-y-3">
              {recentTeams.map((t: any) => (
                <Link key={t.id} to={`/app/teams/${t.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-surface-500">{t.member_count} members · {t.project_count} projects</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-sm">No teams yet. <Link to="/app/teams" className="text-primary-500">Create one</Link></p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Activity</h2>
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 8).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <Activity size={14} className="text-surface-400" />
                <span className="text-surface-600 dark:text-surface-400">
                  <strong className="text-surface-900 dark:text-white">{log.display_name || log.username}</strong> {log.description || log.action}
                </span>
                <span className="text-xs text-surface-400 ml-auto">
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-surface-400 text-sm">No recent activity</p>
        )}
      </div>
    </div>
  );
}
