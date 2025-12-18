import { Plus, Users, ArrowRight } from 'lucide-react';

// Add the new prop type for onNewTeamClick
export default function QuickActions({ onNewTaskClick, onNewTeamClick }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 h-fit shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-3xl -z-10 rounded-full" />
      <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
        <div className="w-2 h-6 bg-purple-500 rounded-full" />
        Quick Actions
      </h2>
      <div className="space-y-4">
        {/* New Task Button */}
        <button 
          onClick={onNewTaskClick} 
          className="w-full group bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-lg shadow-indigo-500/25 active:scale-95 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus size={20} strokeWidth={3} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm">New Task</p>
              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider opacity-80">Add to list</p>
            </div>
          </div>
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </button>

        {/* New Team Button - Now Functional */}
        <button 
          onClick={onNewTeamClick}
          className="w-full group bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-sm active:scale-95 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
              <Users size={20} />
            </div>
            <div className="text-left">
              <p className="font-black text-sm text-zinc-900 dark:text-white">Create Team</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Collaborate</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-zinc-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </button>

        
      </div>
    </div>
  );
}