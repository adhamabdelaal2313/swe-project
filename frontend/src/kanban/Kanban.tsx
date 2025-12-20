import { useState, useEffect, useCallback } from 'react';
import { 
  Plus,  
  ChevronRight, 
  ChevronLeft,
  X,
  Edit2
} from 'lucide-react';
import { useAuth } from '../portal/Context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import TaskModal from '../tasks/TaskModal';

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
const PriorityBadge = ({ 
  priority, 
  onChange 
}: { 
  priority: Priority; 
  onChange?: (p: Priority) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = {
    HIGH: 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 shadow-sm shadow-red-500/10',
    MEDIUM: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 shadow-sm shadow-amber-500/10',
    LOW: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 shadow-sm shadow-emerald-500/10',
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <div
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`text-[10px] font-black px-2.5 py-1 border rounded-full uppercase cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${styles[priority]}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${
          priority === 'HIGH' ? 'bg-red-500 animate-pulse' : 
          priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
        {priority}
        <span className="text-[8px] opacity-40">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
          {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map(p => (
            <button
              key={p}
              onClick={() => { onChange?.(p); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[10px] font-black border-none transition-colors flex items-center justify-between ${
                p === 'LOW' ? 'text-emerald-600 dark:text-emerald-400' : p === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
              } hover:bg-zinc-50 dark:hover:bg-zinc-800 ${priority === p ? 'bg-zinc-100 dark:bg-zinc-800/50' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${p === 'HIGH' ? 'bg-red-500' : p === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {p}
              </div>
              {priority === p && <span className="text-indigo-600 dark:text-indigo-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onMove,
  onDelete,
  onEdit,
  isEditing,
  onStartEdit,
  onSaveEdit,
  editingValue,
  setEditingValue,
  onPriorityChange
}: { 
  task: Task; 
  onMove: (id: number, direction: 'left' | 'right') => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (newTitle: string) => void;
  editingValue: string;
  setEditingValue: (v: string) => void;
  onPriorityChange: (id: number, p: Priority) => void;
}) => {
  return (
    <div className="group relative bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:shadow-none hover:-translate-y-1">
      {/* Top progress indicator or accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-40 group-hover:opacity-100 transition-opacity ${
        task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'
      }`} />
      
      {/* Hover Controls for Moving */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 translate-y-1 group-hover:translate-y-0">
        <button 
          onClick={() => onEdit(task)}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Edit Task"
        >
          <Edit2 size={12} />
        </button>
        <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center"></div>
        {task.status !== 'TODO' && (
          <button 
            onClick={() => onMove(task.id, 'left')}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Move Left"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        {task.status !== 'DONE' && (
          <button 
            onClick={() => onMove(task.id, 'right')}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Move Right"
          >
            <ChevronRight size={14} />
          </button>
        )}
        <div className="w-px h-3 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center"></div>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
          title="Delete"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20">{task.team_name || 'General'}</span>
        {/* Priority Badge moved to footer to avoid overlap with hover controls */}
      </div>

      {isEditing ? (
        <input 
          autoFocus
          className="w-full bg-white dark:bg-black border-2 border-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white mb-2 outline-none shadow-inner"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => onSaveEdit(editingValue)}
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(editingValue)}
        />
      ) : (
        <h3 
          className="text-zinc-900 dark:text-zinc-100 font-bold text-base mb-1.5 cursor-text hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-tight"
          onClick={onStartEdit}
        >
          {task.title}
        </h3>
      )}
      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-5 leading-relaxed line-clamp-2 min-h-[2.5em]">{task.description || ''}</p>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="flex flex-col gap-2">
          <PriorityBadge 
            priority={task.priority} 
            onChange={(p) => onPriorityChange(task.id, p)}
          />
          <div className="flex gap-1.5 overflow-hidden">
            {task.tags && task.tags.length > 0 ? (
              task.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 font-bold">{tag}</span>
              ))
            ) : (
              <span className="text-[10px] italic text-zinc-400">No tags</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 group/assignee self-end">
          <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold opacity-0 group-hover/assignee:opacity-100 transition-opacity duration-200">{task.assignee_name || 'Unassigned'}</span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-zinc-800 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
            {(task.assignee_name || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const Column = ({ 
  title, 
  tasks, 
  colorClass, 
  count,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  editingTaskId,
  onStartEditTask,
  onSaveEditTask,
  onPriorityChangeTask,
  editingTitle,
  setEditingTitle
}: { 
  title: string; 
  status: Status;
  tasks: Task[];
  colorClass: string;
  count: number;
  onMoveTask: (id: number, dir: 'left' | 'right') => void;
  onDeleteTask: (id: number) => void;
  onEditTask: (task: Task) => void;
  editingTaskId: number | null;
  onStartEditTask: (id: number, currentTitle: string) => void;
  onSaveEditTask: (id: number, newTitle: string) => void;
  onPriorityChangeTask: (id: number, p: Priority) => void;
  editingTitle: string;
  setEditingTitle: (v: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 min-w-[260px] sm:min-w-0">
      {/* Column Header */}
      <div className={`flex justify-between items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border ${colorClass} bg-white/50 dark:bg-[#141414]/50 backdrop-blur-sm shadow-sm dark:shadow-none`}>
        <h2 className="text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm tracking-wide uppercase">{title}</h2>
        <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs font-medium">
          {count}
        </span>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2 sm:gap-3 h-full">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onMove={onMoveTask} 
            onDelete={onDeleteTask} 
            onEdit={onEditTask}
            isEditing={editingTaskId === task.id}
            onStartEdit={() => onStartEditTask(task.id, task.title)}
            onSaveEdit={(newVal) => onSaveEditTask(task.id, newVal)}
            editingValue={editingTitle}
            setEditingValue={setEditingTitle}
            onPriorityChange={onPriorityChangeTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 sm:h-32 rounded-lg sm:rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600 text-[10px] sm:text-xs">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default function Kanban() {
  const { fetchWithAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const teamFilter = searchParams.get('teamId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleClearFilter = () => {
    setSearchParams({});
  };

  const handleInPlaceUpdate = async (id: number, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingTaskId(null);
      return;
    }
    try {
      await fetchWithAuth(`/api/kanban/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle })
      });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
    } catch (err) {
      console.error(err);
    } finally {
      setEditingTaskId(null);
    }
  };

  const handlePriorityChange = async (id: number, newPriority: Priority) => {
    try {
      await fetchWithAuth(`/api/kanban/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ priority: newPriority })
      });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const url = teamFilter ? `/api/kanban/tasks?team_id=${teamFilter}` : '/api/kanban/tasks';
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setTasks(data);
      setIsBackendOffline(false);
    } catch (error) {
      console.log("Offline mode active", error);
      setIsBackendOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, teamFilter]);

  // Fetch teams for the filter display
  useEffect(() => {
    const fetchTeamsList = async () => {
      try {
        const response = await fetchWithAuth('/api/teams');
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };
    fetchTeamsList();
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const activeTeamName = teamFilter ? teams.find(t => String(t.id) === String(teamFilter))?.title : null;

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
    <div className="w-full min-h-screen font-sans p-3 sm:p-4 md:p-6">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10 px-3 sm:px-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">Kanban Board</h1>
              {teamFilter && (
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider whitespace-nowrap">
                  {activeTeamName || 'Team Filter Active'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {isBackendOffline ? 'Offline Mode' : 'Connected to Database'}
              </p>
              {teamFilter && (
                <button 
                  onClick={handleClearFilter}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-xs font-medium underline cursor-pointer whitespace-nowrap"
                >
                  Clear Filter
                </button>
              )}
            </div>
        </div>
        
        <button 
          onClick={handleCreateTask}
          className="flex items-center justify-center gap-2 bg-indigo-600 dark:bg-[#2E1065] hover:bg-indigo-700 dark:hover:bg-[#3b0764] text-white dark:text-purple-100 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-indigo-500 dark:border-purple-900/50 transition-all text-xs sm:text-sm font-medium shadow-lg dark:shadow-[0_0_15px_-3px_rgba(88,28,135,0.3)] touch-manipulation w-full sm:w-auto"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span>New Task</span>
        </button>
      </header>

      {isLoading && <div className="text-zinc-500 text-center py-8 sm:py-10 text-sm sm:text-base px-3 sm:px-0">Loading tasks...</div>}

      {/* Kanban Grid - Horizontal scroll on mobile */}
      {!isLoading && (
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-4 sm:pb-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 min-w-[280px] md:min-w-0">
          
          {/* To Do Column */}
          <Column 
            title="To Do" 
            status="TODO"
            tasks={getTasksByStatus('TODO')}
            count={getTasksByStatus('TODO').length}
            colorClass="border-zinc-200 dark:border-zinc-700 shadow-sm dark:shadow-[0_4px_20px_-10px_rgba(255,255,255,0.05)]"
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            editingTaskId={editingTaskId}
            onStartEditTask={(id, title) => { setEditingTaskId(id); setEditingTitle(title); }}
            onSaveEditTask={handleInPlaceUpdate}
            onPriorityChangeTask={handlePriorityChange}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
          />

          {/* In Progress Column */}
          <Column 
            title="In Progress" 
            status="IN_PROGRESS"
            tasks={getTasksByStatus('IN_PROGRESS')}
            count={getTasksByStatus('IN_PROGRESS').length}
            colorClass="border-lime-200 dark:border-lime-500/50 shadow-sm dark:shadow-[0_4px_20px_-10px_rgba(132,204,22,0.1)]"
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            editingTaskId={editingTaskId}
            onStartEditTask={(id, title) => { setEditingTaskId(id); setEditingTitle(title); }}
            onSaveEditTask={handleInPlaceUpdate}
            onPriorityChangeTask={handlePriorityChange}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
          />

          {/* Done Column */}
          <Column 
            title="Done" 
            status="DONE"
            tasks={getTasksByStatus('DONE')}
            count={getTasksByStatus('DONE').length}
            colorClass="border-emerald-200 dark:border-emerald-500/50 shadow-sm dark:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.1)]"
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            editingTaskId={editingTaskId}
            onStartEditTask={(id, title) => { setEditingTaskId(id); setEditingTitle(title); }}
            onSaveEditTask={handleInPlaceUpdate}
            onPriorityChangeTask={handlePriorityChange}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
          />

          </div>
        </div>
      )}

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onTaskUpdated={fetchTasks} 
        taskToEdit={taskToEdit}
        defaultTeamId={teamFilter ? Number(teamFilter) : null}
      />
    </div>
  );
}
