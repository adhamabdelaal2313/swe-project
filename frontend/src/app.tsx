import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

// Feature-first architecture: Import from feature folders
import Dashboard from './dashboard/Dashboard';
import Kanban from './kanban/Kanban';
import Teams from './teams/Teams';
import TaskList from './tasks/TaskList';
import Portal from './portal/portal';
import AdminDashboard from './admin/AdminDashboard';
import Sidebar from './sidebar/sidebar';
import SidebarToggle from './sidebar/Components/Toggle/sidebartoggle';
import { AuthProvider, useAuth } from './portal/Context/AuthContext';
import { SidebarProvider, useSidebar } from './sidebar/Components/Context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';

// Component to update page title based on route
function PageTitle() {
  const location = useLocation();
  
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Portal - TeamFlow',
      '/portal': 'Portal - TeamFlow',
      '/dashboard': 'Dashboard - TeamFlow',
      '/kanban': 'Kanban Board - TeamFlow',
      '/teams': 'Teams - TeamFlow',
      '/tasks': 'Tasks - TeamFlow',
      '/admin': 'Admin Dashboard - TeamFlow',
    };

    document.title = titles[location.pathname] || 'TeamFlow';
  }, [location]);

  return null;
}

// Admin-only layout
function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady, user } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white flex items-center justify-center">
        <span className="text-zinc-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <>
        <Navigate to="/dashboard" replace />
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-zinc-500 mb-4">You need admin privileges to access this page.</p>
          </div>
        </div>
      </>
    );
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();
  const { isOpen } = useSidebar();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white flex items-center justify-center">
        <span className="text-zinc-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated && isAuthReady) {
    return <Navigate to="/portal" state={{ from: location }} replace />;
  }

  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-white flex overflow-hidden">
      <Sidebar />

      {/* Sidebar toggle button - always visible, moves with sidebar on desktop */}
      <div className={`fixed top-3 sm:top-4 z-[120] transition-all duration-300 ${
        isOpen 
          ? (isCollapsed ? 'left-3 sm:left-4 md:left-[92px]' : 'left-3 sm:left-4 md:left-[268px]') 
          : 'left-3 sm:left-4 md:left-[92px]'
      }`}>
        <SidebarToggle />
      </div>

      {/* Main content - Only shifts when sidebar is open */}
      <main className={`flex-1 transition-all duration-300 ${
        isOpen 
          ? (isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]') 
          : 'md:ml-0'
      } min-h-screen overflow-x-hidden overflow-y-auto w-full max-w-full ${
        isOpen 
          ? (isCollapsed ? 'px-3 sm:px-4 md:pl-4 md:pr-4 lg:pl-6 lg:pr-6' : 'px-3 sm:px-4 md:pl-4 md:pr-4 lg:pl-6 lg:pr-6') 
          : 'px-3 sm:px-4 md:px-4 lg:px-6'
      } pt-16 sm:pt-20 md:pt-6 pb-4 sm:pb-6`}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="/portal" element={<Portal />} />

      <Route
        path="/dashboard"
        element={(
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        )}
      />
      <Route
        path="/kanban"
        element={(
          <ProtectedLayout>
            <Kanban />
          </ProtectedLayout>
        )}
      />
      <Route
        path="/teams"
        element={(
          <ProtectedLayout>
            <Teams />
          </ProtectedLayout>
        )}
      />
      <Route
        path="/tasks"
        element={(
          <ProtectedLayout>
            <TaskList />
          </ProtectedLayout>
        )}
      />
      <Route
        path="/admin"
        element={(
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      />

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <PageTitle />
            <AppRoutes />
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}