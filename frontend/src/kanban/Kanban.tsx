import { useState, useEffect } from 'react';
import { 
  Plus,  
  ChevronRight, 
  ChevronLeft,
  X
} from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';

// --- Types ---
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  team: string;
  assignee: string;
  tags: string[];
  due_date: string;
}

// --- Components ---
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    HIGH: 'text-red-500 border-red-900/50 bg-red-950/20',
    MEDIUM: 'text-yellow-500 border-yellow-900/50 bg-yellow-950/20',
    LOW: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded uppercase ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const TaskCard = ({ 
  task, 
  onMove,
  onDelete
}: { 
  task: Task; 
  onMove: (id: number, direction: 'left' | 'right') => void;
  onDelete: (id: number) => void;
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
        <div className="w-px h-3 bg-zinc-800 mx-1 self-center"></div>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-1 hover:bg-red-900/30 text-red-400 rounded"
          title="Delete"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex justify-between items-start mb-3">
        <div className="flex-1"></div> 
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">{task.team}</span>
      </div>

      <h3 className="text-zinc-100 font-semibold text-sm mb-1">{task.title}</h3>
      <p className="text-zinc-500 text-xs mb-4 leading-relaxed">{task.description || ''}</p>

      {task.tags && task.tags.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {task.tags.map((tag, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 font-medium">{tag}</span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center">
        <span className="text-zinc-400 text-xs font-medium">{task.assignee}</span>
        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
          {task.assignee.charAt(0)}
        </div>
      </div>
    </div>
  );
};

const Column = ({ 
  title, 
  status: _status, 
  tasks, 
  colorClass, 
  count,
  onMoveTask,
  onDeleteTask
}: { 
  title: string; 
  status: Status;
  tasks: Task[];
  colorClass: string;
  count: number;
  onMoveTask: (id: number, dir: 'left' | 'right') => void;
  onDeleteTask: (id: number) => void;
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
          <TaskCard key={task.id} task={task} onMove={onMoveTask} onDelete={onDeleteTask} />
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

export default function Kanban() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  
  // Form State
  const [newTask, setNewTask] = useState({ 
    title: '', 
    team: 'General', 
    priority: 'MEDIUM' as Priority,
    assignee: 'Unassigned',
    due_date: ''
  });

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/kanban/tasks');
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        setTasks(data);
        setIsBackendOffline(false);
      } catch (error) {
        console.log("Offline mode active");
        setIsBackendOffline(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Helper to move tasks
  const moveTask = async (taskId: number, direction: 'left' | 'right') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const statusOrder: Status[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    const currentIdx = statusOrder.indexOf(task.status);
    const newIdx = direction === 'right' 
      ? Math.min(currentIdx + 1, 2) 
      : Math.max(currentIdx - 1, 0);
    const newStatus = statusOrder[newIdx];

    if (newStatus === task.status) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch(`/api/kanban/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          userId: user?.id || null,
          userName: user?.name || null
        })
      });
    } catch (error) {
      console.warn("Update failed:", error);
    }
  };

  // Delete task
  const deleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/kanban/tasks/${taskId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          userName: user?.name || null
        })
      });
    } catch (error) {
      console.warn("Delete failed:", error);
    }
  };

  // Create new task
  const handleAddTask = async () => {
    if (!newTask.title) return;

    const taskPayload = {
      title: newTask.title,
      description: '',
      status: 'TODO' as Status,
      priority: newTask.priority,
      team: newTask.team,
      assignee: newTask.assignee,
      tags: [],
      due_date: newTask.due_date,
      userId: user?.id || null,
      userName: user?.name || null
    };

    try {
      const response = await fetch('/api/kanban/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks([...tasks, { ...taskPayload, id: data.id, tags: [] }]);
        setIsModalOpen(false);
        setNewTask({ ...newTask, title: '' });
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const getTasksByStatus = (status: Status) => tasks.filter(t => t.status === status);

  return (
    <div className="w-full bg-[#09090b] text-zinc-100 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Kanban Board</h1>
            <p className="text-zinc-500 text-sm">
              {isBackendOffline ? 'Offline Mode' : 'Connected to Database'}
            </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#2E1065] hover:bg-[#3b0764] text-purple-100 px-5 py-2.5 rounded-lg border border-purple-900/50 transition-all text-sm font-medium shadow-[0_0_15px_-3px_rgba(88,28,135,0.3)]"
        >
          <Plus size={18} />
          New Task
        </button>
      </header>

      {isLoading && <div className="text-zinc-500 text-center py-10">Loading tasks...</div>}

      {/* Kanban Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* To Do Column */}
          <Column 
            title="To Do" 
            status="TODO"
            tasks={getTasksByStatus('TODO')}
            count={getTasksByStatus('TODO').length}
            colorClass="border-zinc-700 shadow-[0_4px_20px_-10px_rgba(255,255,255,0.05)]"
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
          />

          {/* In Progress Column */}
          <Column 
            title="In Progress" 
            status="IN_PROGRESS"
            tasks={getTasksByStatus('IN_PROGRESS')}
            count={getTasksByStatus('IN_PROGRESS').length}
            colorClass="border-lime-500/50 shadow-[0_4px_20px_-10px_rgba(132,204,22,0.1)]"
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
          />

          {/* Done Column */}
          <Column 
            title="Done" 
            status="DONE"
            tasks={getTasksByStatus('DONE')}
            count={getTasksByStatus('DONE').length}
            colorClass="border-emerald-500/50 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.1)]"
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
          />

        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#141414] border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-white">Add New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Title</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600 transition-colors text-white" 
                  placeholder="Enter task title..." 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Priority</label>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600 text-white"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <button 
                onClick={handleAddTask}
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

