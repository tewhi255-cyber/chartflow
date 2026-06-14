import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Project } from '../types';
import { Projector, Plus, MoreVertical, Calendar, Users } from 'lucide-react';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', priority: 'medium' });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await projectAPI.getProjects();
        setProjects(data.data);
      } catch {}
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await projectAPI.createProject(formData);
      navigate(`/app/projects/${data.data.id}`);
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Projects</h1>
          <p className="text-surface-500 mt-1">Manage your projects and tasks</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary gap-2">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="glass-card p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Create New Project</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Project name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input-field">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create Project</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-full mb-2" />
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Projector size={48} className="mx-auto mb-4 text-surface-300" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-surface-500 mb-4">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} to={`/app/projects/${project.id}`} className="glass-card p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  project.priority === 'critical' ? 'bg-red-500' : project.priority === 'high' ? 'bg-amber-500' : project.priority === 'medium' ? 'bg-primary-500' : 'bg-surface-400'
                }`}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <button className="btn-ghost p-1 opacity-0 group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
                  <MoreVertical size={16} />
                </button>
              </div>
              <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{project.name}</h3>
              <p className="text-sm text-surface-500 line-clamp-2 mb-4">{project.description || 'No description'}</p>
              <div className="flex items-center gap-4 text-xs text-surface-400">
                <span className="flex items-center gap-1"><Calendar size={12} /> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date'}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {project.member_count}</span>
                <span className="flex items-center gap-1">{project.completed_tasks}/{project.task_count} done</span>
              </div>
              <div className="mt-3 w-full h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: project.task_count > 0 ? `${(project.completed_tasks / project.task_count) * 100}%` : '0%' }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
