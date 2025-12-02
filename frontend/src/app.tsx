<<<<<<< HEAD
import TaskList from './components/TaskList'; 
import './App.css'; 

function App() {
  return (
    <main className="content-area">
      <h1>Tasks Dashboard</h1>
      <p>Organize and track all your team's tasks in one place.</p>
      <TaskList /> 
    </main>
  )
}

export default App
=======
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users } from 'lucide-react';

// Feature-first architecture: Import from feature folders
import Dashboard from './dashboard/Dashboard';
import Kanban from './kanban/Kanban';
import Teams from './teams/Teams';

// Component to update page title based on route
function PageTitle() {
  const location = useLocation();
  
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Dashboard - TeamFlow',
      '/kanban': 'Kanban Board - TeamFlow',
      '/teams': 'Teams - TeamFlow',
    };
    
    document.title = titles[location.pathname] || 'TeamFlow';
  }, [location]);
  
  return null;
}

export default function App() {
  return (
    <Router>
      <PageTitle />
      <div className="flex h-screen bg-[#09090b] text-white">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-20 border-r border-zinc-800 flex flex-col items-center py-6 gap-6">
          <Link to="/" className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/20 hover:opacity-80 transition-opacity">
            <img 
              src="/TF-Logo.png" 
              alt="TeamFlow Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Logo failed to load:', e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>
          
          <nav className="flex flex-col gap-4 w-full px-2">
            <Link to="/">
              <NavItem icon={<LayoutDashboard size={24} />} />
            </Link>
            <Link to="/kanban">
              <NavItem icon={<KanbanSquare size={24} />} />
            </Link>
            <Link to="/teams">
              <NavItem icon={<Users size={24} />} />
            </Link>
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

function NavItem({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-full h-12 flex items-center justify-center rounded-xl hover:bg-zinc-900 hover:text-white text-zinc-400 transition-colors cursor-pointer">
      {icon}
    </div>
  );
}
>>>>>>> bd9139b48f13aa53170d743a253a4ca230691792
