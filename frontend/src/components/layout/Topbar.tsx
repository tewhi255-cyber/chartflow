import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, Settings, CheckCheck, MessageSquare, Users, Projector, Menu } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleDarkMode, openMobileSidebar } from '../../store/slices/uiSlice';
import { adminAPI, notificationAPI } from '../../services/api';

const NOTIFICATION_ICONS: Record<string, any> = {
  message: MessageSquare, team: Users, project: Projector, system: Bell,
};

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationAPI.getNotifications({ limit: 10 });
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: any) => !n.is_read).length);
      } catch {}
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 1) {
      try {
        const { data } = await adminAPI.search(q);
        setSearchResults(data.data);
        setShowSearch(true);
      } catch {}
    } else {
      setSearchResults(null);
      setShowSearch(false);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
      <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-lg">
        <button onClick={() => dispatch(openMobileSidebar())} className="md:hidden btn-ghost p-2">
          <Menu size={20} />
        </button>
        <div className="relative w-full hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => searchResults && setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 border-none text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
          />
          {showSearch && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-card p-2 max-h-80 overflow-y-auto z-50">
              {searchResults.users?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-surface-500 px-2 py-1">Users</p>
                  {searchResults.users.map((u: any) => (
                    <button key={u.id} onClick={() => { navigate('/app/chat'); setShowSearch(false); }} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-medium">{u.display_name?.charAt(0) || u.username?.charAt(0)}</div>
                      {u.display_name || u.username}
                    </button>
                  ))}
                </div>
              )}
              {searchResults.projects?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-surface-500 px-2 py-1">Projects</p>
                  {searchResults.projects.map((p: any) => (
                    <button key={p.id} onClick={() => { navigate(`/app/projects/${p.id}`); setShowSearch(false); }} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-sm">{p.name}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="btn-ghost relative p-2">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-card p-2 max-h-96 overflow-y-auto z-50 animate-scale-in">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Mark all read</button>
                )}
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((n: any) => {
                    const Icon = NOTIFICATION_ICONS[n.type] || Bell;
                    return (
                      <button key={n.id} className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${n.is_read ? '' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                        <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                          <Icon size={14} className="text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-surface-500 line-clamp-1">{n.body}</p>
                          <p className="text-[10px] text-surface-400 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-surface-400 py-4">No notifications yet</p>
              )}
            </div>
          )}
        </div>

        <button onClick={() => dispatch(toggleDarkMode())} className="btn-ghost p-2">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={() => navigate('/app/profile')} className="btn-ghost p-2">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
