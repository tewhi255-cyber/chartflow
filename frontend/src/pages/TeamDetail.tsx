import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamAPI, projectAPI } from '../services/api';
import { Team, Project } from '../types';
import { Users, Projector, Settings, Plus, Mail, UserMinus, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, projRes] = await Promise.all([
          teamAPI.getTeam(id!), projectAPI.getProjects({ teamId: id })
        ]);
        setTeam(teamRes.data.data);
        setProjects(projRes.data.data);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamAPI.inviteMember(id!, inviteEmail);
      toast.success('Invitation sent!');
      setInviteEmail('');
      setShowInvite(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-64" />
        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-96" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-surface-200 dark:bg-surface-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!team) return <p className="text-surface-500">Team not found</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
            {team.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{team.name}</h1>
            <p className="text-surface-500">{team.member_count} members · {team.project_count} projects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowInvite(!showInvite)} className="btn-primary gap-2">
            <Plus size={16} />
            Invite Member
          </button>
          <button className="btn-secondary p-2.5"><Settings size={18} /></button>
        </div>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="glass-card p-4 animate-slide-down">
          <div className="flex gap-3">
            <input type="email" placeholder="Enter email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input-field flex-1" required />
            <button type="submit" className="btn-primary gap-2"><Mail size={16} /> Send</button>
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {team.description && (
        <p className="text-surface-600 dark:text-surface-400">{team.description}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Projects</h2>
              <Link to="/app/projects" className="text-sm text-primary-500 hover:text-primary-600">View all</Link>
            </div>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((p) => (
                  <Link key={p.id} to={`/app/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Projector size={18} className="text-surface-400" />
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-surface-500">{p.task_count} tasks</p>
                      </div>
                    </div>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-surface-400 text-sm">No projects in this team</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                <Users size={18} />
                Members
              </h2>
              <span className="text-sm text-surface-500">{team.member_count}</span>
            </div>
            <div className="space-y-3">
              {team.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-semibold">
                    {member.display_name?.charAt(0)?.toUpperCase() || member.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{member.display_name || member.username}</p>
                    <p className="text-xs text-surface-500 capitalize">{member.role}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-emerald-500' : 'bg-surface-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
