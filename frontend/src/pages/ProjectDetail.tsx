import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Project, Task } from '../types';
import { Plus, Settings, MoreVertical, Calendar, User, MessageSquare, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const statusColumns = [
  { key: 'backlog', label: 'Backlog', color: 'bg-surface-400' },
  { key: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { key: 'review', label: 'Review', color: 'bg-purple-500' },
  { key: 'done', label: 'Done', color: 'bg-emerald-500' },
];

const priorityConfig = {
  urgent: { label: 'Urgent', class: 'badge-danger' },
  high: { label: 'High', class: 'badge-warning' },
  medium: { label: 'Medium', class: 'badge-primary' },
  low: { label: 'Low', class: 'badge' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          projectAPI.getProject(id!), projectAPI.getTasks(id!)
        ]);
        setProject(projRes.data.data);
        setTasks(taskRes.data.data);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await projectAPI.createTask(id!, newTask);
      setTasks([...tasks, { ...data.data, status: 'todo' } as Task]);
      setNewTask({ title: '', description: '', priority: 'medium' });
      setShowCreateTask(false);
      toast.success('Task created');
    } catch {}
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await projectAPI.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t));
      toast.success('Task moved');
    } catch {}
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    handleStatusChange(draggableId, newStatus);
  };

  const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

  const taskAnalytics = statusColumns.map(col => ({
    name: col.label, count: getTasksByStatus(col.key).length, fill: col.color.replace('bg-', '#'),
  }));

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-64" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-96 bg-surface-200 dark:bg-surface-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!project) return <p className="text-surface-500">Project not found</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{project.name}</h1>
            <span className={`badge ${
              project.status === 'active' ? 'badge-success' : project.status === 'completed' ? 'badge-primary' : 'badge-warning'
            }`}>{project.status}</span>
          </div>
          <p className="text-surface-500 mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAnalytics(!showAnalytics)} className="btn-secondary gap-2">
            <BarChart3 size={16} /> Analytics
          </button>
          <button className="btn-secondary p-2.5"><Settings size={18} /></button>
        </div>
      </div>

      {showAnalytics && (
        <div className="glass-card p-6 animate-slide-down">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Task Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {taskAnalytics.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateTask(!showCreateTask)} className="btn-primary gap-2">
            <Plus size={16} /> Add Task
          </button>
        </div>
        <p className="text-sm text-surface-500">{tasks.filter(t => t.status === 'done').length}/{tasks.length} completed</p>
      </div>

      {showCreateTask && (
        <form onSubmit={handleCreateTask} className="glass-card p-6 animate-slide-down">
          <h3 className="text-lg font-semibold mb-4">New Task</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="input-field" required />
            <textarea placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="input-field" rows={2} />
            <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowCreateTask(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {statusColumns.map((col) => (
            <div key={col.key} className="min-w-[250px]">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 uppercase">{col.label}</h3>
                <span className="text-xs text-surface-400 ml-auto">{getTasksByStatus(col.key).length}</span>
              </div>
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[120px] p-2 rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    {getTasksByStatus(col.key).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`glass-card p-4 transition-all ${
                              snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : 'hover:shadow-md'
                            } ${snapshot.isDragging ? 'bg-white dark:bg-surface-800' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`badge text-xs ${
                                task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : task.priority === 'medium' ? 'badge-primary' : 'badge'
                              }`}>{task.priority}</span>
                              <button className="btn-ghost p-1" onClick={(e) => e.stopPropagation()}><MoreVertical size={14} /></button>
                            </div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-surface-500 line-clamp-2 mb-3">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-surface-400">
                              {task.due_date && (
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}</span>
                              )}
                              {task.assignee_name && (
                                <span className="flex items-center gap-1"><User size={12} /> {task.assignee_name}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
