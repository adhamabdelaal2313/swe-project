import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users, ListTodo, Shield } from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';
import { useSidebar } from './Components/Context/SidebarContext';
import ThemeToggle from './Components/ThemeToggle';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const menuItems: SidebarItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/kanban', label: 'Kanban', icon: <KanbanSquare size={20} /> },
  { path: '/teams', label: 'Teams', icon: <Users size={20} /> },
  { path: '/tasks', label: 'Tasks', icon: <ListTodo size={20} /> },
  { path: '/admin', label: 'Admin', icon: <Shield size={20} />, adminOnly: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, isCollapsed, close } = useSidebar();
  
  // On desktop: if not open, show collapsed. If open, respect collapsed state
  // On mobile: respect isOpen state
  const effectiveCollapsed = isCollapsed || (!isOpen);

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
      
      {/* Sidebar - Always visible on desktop (at least collapsed), respects isOpen on mobile */}
      <div className={`fixed left-0 top-0 h-screen bg-zinc-50 dark:bg-zinc-950 border-r-2 border-zinc-300 dark:border-zinc-800 flex flex-col shadow-xl dark:shadow-2xl z-[100] transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen 
          ? `translate-x-0 ${isCollapsed ? 'w-20 p-3' : 'w-[260px] p-6'}` 
          : `md:translate-x-0 md:w-20 md:p-3 -translate-x-full`
      }`}>
        {/* Subtle background glow for Dark Mode */}
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-500/5 blur-[100px] pointer-events-none hidden dark:block" />

        <div className={`mb-4 pb-4 border-b-2 border-zinc-200 dark:border-zinc-800 flex justify-between items-center relative z-10 flex-shrink-0 ${effectiveCollapsed ? 'flex-col gap-2' : ''}`}>
          <Link to="/dashboard" className={`flex items-center hover:opacity-80 transition-opacity flex-shrink-0 ${isCollapsed ? 'flex-col gap-2' : 'gap-3'}`}>
            <div className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-500/20 shadow-md dark:shadow-sm overflow-hidden p-1.5`}>
              <img 
                src="/TF-Logo.png"
                alt="TeamFlow Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-logo')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'fallback-logo text-indigo-600 dark:text-indigo-400 text-lg font-black';
                    fallback.textContent = 'TF';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            {!effectiveCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight leading-none">TeamFlow</span>
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] mt-0.5 ml-0.5">Workspace</span>
              </div>
            )}
          </Link>
          <button 
            className="md:hidden bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg w-8 h-8 flex items-center justify-center text-zinc-400 text-xl leading-none cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900" 
            onClick={close}
          >
            ×
          </button>
        </div>
        
        <nav className={`flex-1 flex flex-col gap-1 relative z-10 min-h-0 ${effectiveCollapsed ? 'items-center' : ''}`}>
          {menuItems
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) close();
                  }}
                    className={`group flex items-center rounded-lg transition-all duration-200 text-xs font-semibold ${
                      effectiveCollapsed 
                        ? `justify-center px-2 py-2 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-indigo-400'}`
                        : `gap-2 px-3 py-2 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-indigo-400'}`
                    }`}
                  title={effectiveCollapsed ? item.label : ''}
                >
                  <span className={`${effectiveCollapsed ? 'w-5' : 'w-4'} flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-indigo-500'}`}>
                    {item.icon}
                  </span>
                  {!effectiveCollapsed && (
                    <>
                      <span className="flex-1 text-xs">{item.label}</span>
                      {isActive && (
                        <div className="w-1 h-1 rounded-full bg-white/40 shadow-[0_0_6px_white]" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
        </nav>
        
        <div className={`pt-3 border-t-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 relative z-10 flex-shrink-0 ${effectiveCollapsed ? 'items-center' : ''}`}>
          <div className={effectiveCollapsed ? 'w-full flex justify-center' : ''}>
            <ThemeToggle />
          </div>
          {!effectiveCollapsed && (
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900/50 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg shadow-md dark:shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-zinc-900 dark:text-white font-semibold text-xs truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-zinc-600 dark:text-zinc-500 text-[10px] leading-tight truncate">
                  {user?.email || 'user@teamflow.com'}
                </div>
                <div className="mt-1">
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-[0.1em] border ${
                    user?.role === 'admin' 
                      ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' 
                      : 'bg-zinc-200 border-zinc-300 text-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-500'
                  }`}>
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          )}
          {effectiveCollapsed && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-md">
              {user ? getInitials(user.name) : 'U'}
            </div>
          )}
          {/* Sign Out button - always visible */}
          <button 
            className={`w-full bg-white dark:bg-transparent border-2 border-red-300 dark:border-red-900/30 rounded-lg px-3 py-2 text-red-600 dark:text-red-400 text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-400 dark:hover:border-red-900/50 shadow-sm dark:shadow-none flex items-center justify-center gap-2 flex-shrink-0 ${
              effectiveCollapsed ? 'px-2 py-2' : ''
            }`}
            onClick={handleLogout}
            title="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {!effectiveCollapsed && <span className="text-xs">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
}