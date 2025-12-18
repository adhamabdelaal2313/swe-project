import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users, ListTodo } from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';
import { useSidebar } from './Components/Context/SidebarContext';
import ThemeToggle from './Components/ThemeToggle';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/kanban', label: 'Kanban', icon: <KanbanSquare size={20} /> },
  { path: '/teams', label: 'Teams', icon: <Users size={20} /> },
  { path: '/tasks', label: 'Tasks', icon: <ListTodo size={20} /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, close } = useSidebar();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] transition-opacity duration-300 ${isOpen ? 'opacity-100 block md:hidden' : 'opacity-0 pointer-events-none hidden'}`}
        onClick={close} 
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-[260px] h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-6 shadow-2xl z-[100] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        {/* Subtle background glow for Dark Mode */}
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/5 blur-[100px] pointer-events-none hidden dark:block" />

        <div className="mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center relative z-10">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 shadow-sm overflow-hidden p-2">
              <img 
                src="/TF-Logo.png" 
                alt="TeamFlow Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = '0.3';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight leading-none">TeamFlow</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 ml-0.5">Workspace</span>
            </div>
          </Link>
          <button 
            className="md:hidden bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg w-8 h-8 flex items-center justify-center text-zinc-400 text-xl leading-none cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900" 
            onClick={close}
          >
            ×
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1.5 relative z-10">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) close();
                }}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <span className={`w-5 flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-indigo-500'}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40 shadow-[0_0_8px_white]" />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-4 relative z-10">
          <ThemeToggle />
          <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-zinc-900 dark:text-white font-bold text-sm truncate">
                {user?.name || 'User'}
              </div>
              <div className="flex flex-col">
                <div className={`text-zinc-500 dark:text-zinc-500 mt-0.5 leading-tight truncate font-medium ${
                  (user?.email?.length || 0) > 25 ? 'text-[9px]' : 
                  (user?.email?.length || 0) > 20 ? 'text-[10px]' : 'text-xs'
                }`}>
                  {user?.email || 'user@teamflow.com'}
                </div>
                <div className="mt-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.1em] border ${
                    user?.role === 'admin' 
                      ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' 
                      : 'bg-zinc-200 border-zinc-300 text-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-500'
                  }`}>
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button 
            className="w-full bg-white dark:bg-transparent border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-900/50" 
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}