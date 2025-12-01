import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users } from 'lucide-react';

// Import the pages you just made
import Dashboard from '../dashboard-frontend/Dashboard';
import Kanban from './pages/Kanban';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#09090b] text-white">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-20 border-r border-zinc-800 flex flex-col items-center py-6 gap-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            TF
          </div>
          
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
            {/* You can add Teams later */}
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