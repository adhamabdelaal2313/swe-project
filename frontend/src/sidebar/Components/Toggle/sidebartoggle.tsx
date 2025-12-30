import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '../Context/SidebarContext';
import { useEffect, useState } from 'react';

export default function SidebarToggle() {
  const { isOpen, isCollapsed, toggle } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button 
        className="bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-lg w-10 h-10 flex items-center justify-center text-zinc-700 dark:text-zinc-400 text-lg cursor-pointer transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-700 flex-shrink-0 shadow-md dark:shadow-sm" 
        onClick={toggle}
        aria-label={isDesktop ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : (isOpen ? 'Close sidebar' : 'Open sidebar')}
        title={isDesktop ? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : (isOpen ? 'Close sidebar' : 'Open sidebar')}
      >
        {isDesktop ? (
          // On desktop, show chevron based on collapsed state (always visible)
          isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
        ) : (
          // On mobile, show menu/X based on open state
          isOpen ? <X size={20} /> : <Menu size={20} />
        )}
      </button>
    </div>
  );
}
