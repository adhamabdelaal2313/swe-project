import { Menu, X } from 'lucide-react';
import { useSidebar } from '../Context/SidebarContext';

export default function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button 
      className="bg-zinc-900 border border-zinc-800 rounded-lg w-10 h-10 flex items-center justify-center text-zinc-400 text-lg cursor-pointer transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700 flex-shrink-0" 
      onClick={toggle}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}
