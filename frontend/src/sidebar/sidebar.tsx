import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, Users } from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';
import { useSidebar } from './Components/Context/SidebarContext';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/kanban', label: 'Kanban', icon: <KanbanSquare size={20} /> },
  { path: '/teams', label: 'Teams', icon: <Users size={20} /> },
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
      <div className={`fixed left-0 top-0 w-[260px] h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col p-6 shadow-2xl z-[100] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="mb-8 pb-6 border-b border-zinc-800 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <img 
                src="/TF-Logo.png" 
                alt="TeamFlow Logo" 
                className="max-w-full max-h-full w-auto h-auto object-contain"
                style={{ width: '100%', height: '100%', padding: '6px' }}
                onError={(e) => {
                  console.error('Logo failed to load. Check browser console and ensure /TF-Logo.png exists in public folder.');
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
                onLoad={() => console.log('Logo loaded successfully')}
              />
            </div>
            <span className="text-3xl font-bold text-white mb-2">TeamFlow</span>
          </Link>
          <button 
            className="md:hidden bg-transparent border border-zinc-800 rounded-lg w-8 h-8 flex items-center justify-center text-zinc-400 text-xl leading-none cursor-pointer transition-all hover:border-zinc-700 hover:text-white hover:bg-zinc-900" 
            onClick={close}
          >
            ×
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) {
                  close();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 text-zinc-300 no-underline rounded-lg transition-all text-sm font-medium hover:bg-zinc-900 hover:text-white ${
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? 'bg-zinc-900 border border-zinc-800 text-white' 
                  : ''
              }`}
            >
              <span className="w-5 flex items-center justify-center">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-indigo-600 border border-indigo-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.name || 'User'}
              </div>
              <div className="text-zinc-400 text-xs mt-0.5">
                {user?.email || 'user@teamflow.com'}
              </div>
            </div>
          </div>
          <button 
            className="w-full bg-red-950/20 border border-red-900/50 rounded-lg px-4 py-2.5 text-red-400 text-sm font-semibold cursor-pointer transition-all hover:bg-red-950/30 hover:border-red-900/70" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}