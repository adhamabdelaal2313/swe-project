import { Menu, X } from 'lucide-react';
import { useSidebar } from '../Context/SidebarContext';

export default function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button 
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-10 h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-lg cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 flex-shrink-0 shadow-sm dark:shadow-none" 
      onClick={toggle}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}
