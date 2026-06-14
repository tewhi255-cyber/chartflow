import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { closeMobileSidebar } from '../../store/slices/uiSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileSidebarOpen) {
        dispatch(closeMobileSidebar());
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, mobileSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => dispatch(closeMobileSidebar())}
        />
      )}
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} max-md:ml-0`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
