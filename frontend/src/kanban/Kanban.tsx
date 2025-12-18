import { useState, useEffect } from 'react';
import { 
  Plus,  
  ChevronRight, 
  ChevronLeft,
  X,
  Edit2
} from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TaskModal from '../tasks/TaskModal';

// ... rest of the types ...
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: number;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  team_id: number | null;
  team_name?: string;
  assignee_id: number | null;
  assignee_name?: string;
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
  onDelete,
  onEdit
}: { 
  task: Task; 
  onMove: (id: number, direction: 'left' | 'right') => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}) => {
  return (
    <div className="group relative bg-[#141414] border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors duration-200">
      
      {/* Hover Controls for Moving */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button 
          onClick={() => onEdit(task)}
          className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
          title="Edit Task"
        >
          <Edit2 size={14} />
        </button>
        <div className="w-px h-3 bg-zinc-800 mx-1 self-center"></div>
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
        <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">{task.team_name || 'General'}</span>
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
        <span className="text-zinc-400 text-xs font-medium">{task.assignee_name || 'Unassigned'}</span>
        <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
          {(task.assignee_name || 'U').charAt(0)}
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
  onDeleteTask,
  onEditTask
}: { 
  title: string; 
  status: Status;
  tasks: Task[];
  colorClass: string;
  count: number;
  onMoveTask: (id: number, dir: 'left' | 'right') => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
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
          <TaskCard key={task.id} task={task} onMove={onMoveTask} onDelete={onDeleteTask} onEdit={onEditTask} />
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
  const { user, fetchWithAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const teamFilter = searchParams.get('teamId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  
  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const url = teamFilter ? `/api/kanban/tasks?team_id=${teamFilter}` : '/api/kanban/tasks';
      const response = await fetchWithAuth(url);
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

  useEffect(() => {
    fetchTasks();
  }, [fetchWithAuth, teamFilter]);

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

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
      await fetchWithAuth(`/api/kanban/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: newStatus
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
      await fetchWithAuth(`/api/kanban/tasks/${taskId}`, { 
        method: 'DELETE'
      });
    } catch (error) {
      console.warn("Delete failed:", error);
    }
  };

  const getTasksByStatus = (status: Status) => tasks.filter(t => t.status === status);

  return (
    <div className="w-full bg-[#09090b] text-zinc-100 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white mb-1">Kanban Board</h1>
              {teamFilter && (
                <span className="px-2 py-0.5 bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Team Filter Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-zinc-500 text-sm">
                {isBackendOffline ? 'Offline Mode' : 'Connected to Database'}
              </p>
              {teamFilter && (
                <button 
                  onClick={() => navigate('/kanban')}
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-medium underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
        </div>
        
        <button 
          onClick={handleCreateTask}
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
            onEditTask={handleEditTask}
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
            onEditTask={handleEditTask}
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
            onEditTask={handleEditTask}
          />

        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onTaskUpdated={fetchTasks} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
}

