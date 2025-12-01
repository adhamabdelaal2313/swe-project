import React, { useState } from 'react';
import { 
  Menu, 
  Plus,  
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft,
  X
} from 'lucide-react';

// --- Types ---
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  status: Status;
}

// --- Mock Data ---
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Design System Update',
    description: 'Update component library with new design tokens',
    assignee: 'Sarah Chen',
    priority: 'HIGH',
    status: 'TODO'
  },
  {
    id: '2',
    title: 'User Dashboard',
    description: 'Create new dashboard layout',
    assignee: 'Emma Wilson',
    priority: 'HIGH',
    status: 'TODO'
  },
  {
    id: '3',
    title: 'API Integration',
    description: 'Integrate user authentication API',
    assignee: 'Mike Johnson',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS'
  },
  {
    id: '4',
    title: 'Bug Fixes',
    description: 'Fix login page validation issues',
    assignee: 'Sarah Chen',
    priority: 'HIGH',
    status: 'IN_PROGRESS'
  },
  {
    id: '5',
    title: 'Documentation',
    description: 'Write API documentation',
    assignee: 'Alex Brown',
    priority: 'LOW',
    status: 'DONE'
  },
  {
    id: '6',
    title: 'Performance Optimization',
    description: 'Optimize database queries',
    assignee: 'Mike Johnson',
    priority: 'MEDIUM',
    status: 'DONE'
  }
];

// --- Components ---

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    HIGH: 'text-red-500 border-red-900/50 bg-red-950/20',
    MEDIUM: 'text-yellow-500 border-yellow-900/50 bg-yellow-950/20',
    LOW: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const TaskCard = ({ 
  task, 
  onMove 
}: { 
  task: Task; 
  onMove: (id: string, direction: 'left' | 'right') => void 
}) => {
  return (
    <div className="group relative bg-[#141414] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors duration-200">
      
      {/* Hover Controls for Moving */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {task.status !== 'TODO' && (
          <button 
            onClick={() => onMove(task.id, 'left')}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
            title="Move Left"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {task.status !== 'DONE' && (
          <button 
            onClick={() => onMove(task.id, 'right')}
            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
            title="Move Right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-start mb-3">
        {/* Placeholder for spacing if no badge, but logic ensures badge is always right aligned visually */}
        <div className="flex-1"></div> 
        <PriorityBadge priority={task.priority} />
      </div>

      <h3 className="text-zinc-100 font-semibold text-sm mb-1">{task.title}</h3>
      <p className="text-zinc-500 text-xs mb-4 leading-relaxed">{task.description}</p>

      <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center">
        <span className="text-zinc-400 text-xs font-medium">{task.assignee}</span>
        {/* Simple Avatar Placeholder */}
        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
          {task.assignee.charAt(0)}
        </div>
      </div>
    </div>
  );
};

const Column = ({ 
  title, 
  status, 
  tasks, 
  colorClass, 
  count,
  onMoveTask
}: { 
  title: string; 
  status: Status;
  tasks: Task[];
  colorClass: string;
  count: number;
  onMoveTask: (id: string, dir: 'left' | 'right') => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Column Header */}
      <div className={`flex justify-between items-center p-4 rounded-xl border ${colorClass} bg-[#141414]/50 backdrop-blur-sm`}>
        <h2 className="text-zinc-100 font-bold text-sm tracking-wide uppercase">{title}</h2>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
          {count}
        </span>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3 h-full">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onMove={onMoveTask} />
        ))}
        {tasks.length === 0 && (
          <div className="h-32 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to move tasks
  const moveTask = (taskId: string, direction: 'left' | 'right') => {
    const statusOrder: Status[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      
      const currentIndex = statusOrder.indexOf(t.status);
      const newIndex = direction === 'right' 
        ? Math.min(currentIndex + 1, 2)
        : Math.max(currentIndex - 1, 0);
      
      return { ...t, status: statusOrder[newIndex] };
    }));
  };

  const getTasksByStatus = (status: Status) => tasks.filter(t => t.status === status);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 md:p-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-start gap-4">
          <button className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
            <Menu className="text-zinc-400" size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Kanban Board</h1>
            <p className="text-zinc-500 text-sm">Manage your team's tasks and track progress</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#2E1065] hover:bg-[#3b0764] text-purple-100 px-5 py-2.5 rounded-lg border border-purple-900/50 transition-all text-sm font-medium shadow-[0_0_15px_-3px_rgba(88,28,135,0.3)]"
        >
          <Plus size={18} />
          New Task
        </button>
      </header>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* To Do Column */}
        <Column 
          title="To Do" 
          status="TODO"
          tasks={getTasksByStatus('TODO')}
          count={getTasksByStatus('TODO').length}
          colorClass="border-zinc-700 shadow-[0_4px_20px_-10px_rgba(255,255,255,0.05)]"
          onMoveTask={moveTask}
        />

        {/* In Progress Column */}
        <Column 
          title="In Progress" 
          status="IN_PROGRESS"
          tasks={getTasksByStatus('IN_PROGRESS')}
          count={getTasksByStatus('IN_PROGRESS').length}
          colorClass="border-lime-500/50 shadow-[0_4px_20px_-10px_rgba(132,204,22,0.1)]"
          onMoveTask={moveTask}
        />

        {/* Done Column */}
        <Column 
          title="Done" 
          status="DONE"
          tasks={getTasksByStatus('DONE')}
          count={getTasksByStatus('DONE').length}
          colorClass="border-emerald-500/50 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.1)]"
          onMoveTask={moveTask}
        />

      </div>

      {/* Simple "New Task" Modal (Visual Only for Demo) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-6">Add New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600 transition-colors text-white" placeholder="Enter task title..." />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Priority</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded border border-red-900/30 bg-red-950/20 text-red-500 text-xs font-bold hover:bg-red-950/40">HIGH</button>
                  <button className="flex-1 py-2 rounded border border-yellow-900/30 bg-yellow-950/20 text-yellow-500 text-xs font-bold hover:bg-yellow-950/40">MEDIUM</button>
                  <button className="flex-1 py-2 rounded border border-emerald-900/30 bg-emerald-950/20 text-emerald-500 text-xs font-bold hover:bg-emerald-950/40">LOW</button>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-white text-black font-bold py-3 rounded-lg mt-4 hover:bg-zinc-200 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}