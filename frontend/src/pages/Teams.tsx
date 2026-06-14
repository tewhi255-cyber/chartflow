import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../services/api';
import { Team } from '../types';
import { Users, Plus, Settings, MoreVertical } from 'lucide-react';

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await teamAPI.getTeams();
        setTeams(data.data);
      } catch {}
      setLoading(false);
    };
    fetchTeams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await teamAPI.createTeam(formData);
      navigate(`/app/teams/${data.data.id}`);
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Teams</h1>
          <p className="text-surface-500 mt-1">Collaborate with your team members</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary gap-2">
          <Plus size={16} />
          New Team
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Create New Team</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Team name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
            <textarea placeholder="Description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create Team</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-surface-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24" />
                  <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-full mb-2" />
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-surface-300" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No teams yet</h3>
          <p className="text-surface-500 mb-4">Create your first team to start collaborating</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Team</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="glass-card p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{team.name}</h3>
                    <p className="text-xs text-surface-500">{team.member_count} members</p>
                  </div>
                </div>
                <button className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); }}>
                  <MoreVertical size={16} />
                </button>
              </div>
              <p className="text-sm text-surface-500 line-clamp-2">{team.description || 'No description'}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-surface-400">
                <span>{team.project_count} projects</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
