import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

// Feature-first architecture: Import from feature folders
import Dashboard from './dashboard/Dashboard';
import Kanban from './kanban/Kanban';
import Teams from './teams/Teams';
import Portal from './portal/portal';
import Sidebar from './sidebar/sidebar';
import SidebarToggle from './sidebar/Components/Toggle/sidebartoggle';
import { AuthProvider, useAuth } from './portal/Context/AuthContext';
import { SidebarProvider, useSidebar } from './sidebar/Components/Context/SidebarContext';

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
    };
    
    document.title = titles[location.pathname] || 'TeamFlow';
  }, [location]);
  
  return null;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const location = useLocation();
  const { isOpen } = useSidebar();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <span className="text-zinc-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated && isAuthReady) {
    return <Navigate to="/portal" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex overflow-hidden">
      <Sidebar />

      {/* Sidebar toggle button - always visible, moves with sidebar on desktop */}
      <div className={`fixed top-4 z-[120] transition-all duration-300 ${isOpen ? 'left-4 md:left-[268px]' : 'left-4'}`}>
        <SidebarToggle />
      </div>

      {/* Main content with proper spacing to avoid overlap with toggle button */}
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'md:ml-[260px]' : 'md:ml-0'} min-h-screen overflow-x-hidden overflow-y-auto ${isOpen ? 'px-4 md:pl-20 md:pr-8' : 'pl-20 md:pl-24 pr-4 md:pr-8'} pt-20 md:pt-6 pb-6`}>
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
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/kanban"
        element={
          <ProtectedLayout>
            <Kanban />
          </ProtectedLayout>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedLayout>
            <Teams />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <PageTitle />
          <AppRoutes />
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}