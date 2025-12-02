import { Plus, Users } from 'lucide-react';

// Add the new prop type for onNewTeamClick
export default function QuickActions({ onNewTaskClick, onNewTeamClick }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
      <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
      <div className="space-y-3">
        {/* New Task Button */}
        <button 
          onClick={onNewTaskClick} 
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} /> New Task
        </button>

        {/* New Team Button - Now Functional */}
        <button 
          onClick={onNewTeamClick}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Users size={18} /> New Team
        </button>

        
      </div>
    </div>
  );
}