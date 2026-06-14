import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebarCollapsed } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { disconnectSocket } from '../../services/socket';
import {
  LayoutDashboard, MessageSquare, FolderOpen, Users, Projector,
  LogOut, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/app/files', icon: FolderOpen, label: 'Files' },
  { to: '/app/teams', icon: Users, label: 'Teams' },
  { to: '/app/projects', icon: Projector, label: 'Projects' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout: doLogout } = useAuth();
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector((state: RootState) => state.ui);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {}
    }
    disconnectSocket();
    doLogout();
    navigate('/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen z-30 flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} max-md:${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200 dark:border-surface-800">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="font-semibold text-surface-900 dark:text-white">ChartFlow</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' || user?.role === 'super_admin' ? (
          <NavLink
            to="/app/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <Shield size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Admin</span>}
          </NavLink>
        ) : null}
      </nav>

      <div className="p-2 border-t border-surface-200 dark:border-surface-800">
        <NavLink
          to="/app/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-sm font-semibold">
            {user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.display_name || user?.username}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full mt-1 px-3 py-2.5 rounded-xl transition-all duration-200 text-surface-600 dark:text-surface-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!sidebarCollapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>

      <button
        onClick={() => dispatch(toggleSidebarCollapsed())}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-500 hover:text-surface-700 transition-colors shadow-sm"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
