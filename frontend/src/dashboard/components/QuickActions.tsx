import React from 'react';
import { Plus, Users, FileBarChart } from 'lucide-react';

interface QuickActionsProps {
  onNewTaskClick: () => void;
}

export default function QuickActions({ onNewTaskClick }: QuickActionsProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-fit">
      <h2 className="text-lg font-bold text-white mb-6">Quick Actions</h2>
      <div className="space-y-3">
        {/* Primary Button (Blue) */}
        <button 
          onClick={onNewTaskClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>

        {/* Secondary Button (Gray) */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all">
          <Users size={20} />
          <span>New Team</span>
        </button>

        {/* Secondary Button (Gray) */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all">
          <FileBarChart size={20} />
          <span>View Reports</span>
        </button>
      </div>
    </div>
  );
}