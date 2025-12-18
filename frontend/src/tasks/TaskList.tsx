import { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import TaskModal from './TaskModal';
import { useAuth } from '../portal/Context/AuthContext';
import { useSearchParams } from 'react-router-dom';

// Task shape returned by backend
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  team_id: number | null;
  team_name?: string;
  assignee_id: number | null;
  assignee_name?: string;
  tags: string[];
  due_date: string;
  created_at: string;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const { fetchWithAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const teamFilter = searchParams.get('teamId');

  // Load all tasks from backend; search & status filtering are done client-side
  const fetchTasks = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const url = teamFilter ? `/api/tasks?team_id=${teamFilter}` : '/api/tasks';
        const response = await fetchWithAuth(url, signal ? { signal } : undefined);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Task[] = await response.json();
        setTasks(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError('Failed to fetch tasks: ' + e.message);
          setTasks([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, teamFilter]
  );

  // Fetch teams for the filter display
  useEffect(() => {
    const fetchTeams = async () => {
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
    fetchTeams();
  }, [fetchWithAuth]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const handler = setTimeout(() => {
      fetchTasks(signal);
    }, 300);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [searchQuery, fetchTasks, teamFilter]);

  const activeTeamName = teamFilter ? teams.find(t => String(t.id) === String(teamFilter))?.title : null;

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetchWithAuth(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      fetchTasks();
    } catch (e: any) {
      alert('Failed to delete task: ' + e.message);
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };
  const handleCreateClick = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const getStatusBadgeClass = (status: string) => {
    if (!status) {
      return 'inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-700/40 text-zinc-200 border border-zinc-600';
    }
    switch (status) {
      case 'IN_PROGRESS':
        return 'inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/40';
      case 'DONE':
        return 'inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/40';
      case 'TODO':
      default:
        return 'inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-700/40 text-zinc-200 border border-zinc-600';
    }
  };

  const getPriorityClass = (priority: string) => {
    if (priority === 'HIGH') return 'text-red-400';
    if (priority === 'MEDIUM') return 'text-orange-400';
    return 'text-emerald-400';
  };

  const [activeDropdown, setActiveDropdown] = useState<{ id: number; field: string } | null>(null);

  const handleInPlaceUpdate = async (id: number, field: string, value: any) => {
    try {
      await fetchWithAuth(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: value })
      });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
      setActiveDropdown(null);
    } catch (e: any) {
      alert('Failed to update: ' + e.message);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleGlobalClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((t) => {
    // Text search across key columns
    if (normalizedQuery) {
      const haystack = [
        t.title,
        t.description,
        t.team_name || 'General',
        t.assignee_name || 'Unassigned',
        t.priority,
        t.status,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="w-full min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Tasks</h1>
            {teamFilter && (
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                {activeTeamName || 'Team Filter Active'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Browse, search, and manage all tasks across your teams.
            </p>
            {teamFilter && (
              <button 
                onClick={() => setSearchParams({})}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium underline cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm dark:shadow-none transition-colors"
            />
          </div>

          <button
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-colors whitespace-nowrap"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3 text-xs md:text-sm">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-zinc-100 dark:bg-zinc-800/70 text-indigo-600 dark:text-indigo-400 border-zinc-200 dark:border-zinc-700'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('TODO')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'TODO'
              ? 'bg-zinc-100 dark:bg-zinc-800/70 text-indigo-600 dark:text-indigo-400 border-zinc-200 dark:border-zinc-700'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          To Do ({tasks.filter((t) => t.status === 'TODO').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-zinc-100 dark:bg-zinc-800/70 text-indigo-600 dark:text-indigo-400 border-zinc-200 dark:border-zinc-700'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          In Progress ({tasks.filter((t) => t.status === 'IN_PROGRESS').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('DONE')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'DONE'
              ? 'bg-zinc-100 dark:bg-zinc-800/70 text-indigo-600 dark:text-indigo-400 border-zinc-200 dark:border-zinc-700'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Done ({tasks.filter((t) => t.status === 'DONE').length})
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-[#111114] border border-zinc-200 dark:border-zinc-800/70 rounded-2xl shadow-xl dark:shadow-black/40 transition-all duration-300">
        <div className="hidden md:flex items-center px-6 py-4 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900/80 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] rounded-t-2xl relative">
          <div className="absolute bottom-0 left-0 h-[2px] w-12 bg-indigo-500 rounded-full" />
          <div className="flex-[1.5]">Task Details</div>
          <div className="flex-[1.5]">Description</div>
          <div className="flex-1">Team</div>
          <div className="flex-1">Priority</div>
          <div className="flex-1">Status</div>
          <div className="flex-1 text-right">Actions</div>
        </div>

        {/* STATES */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-zinc-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            Fetching your tasks...
          </div>
        )}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/10 border-y border-red-100 dark:border-red-900/20">
            {error}
          </div>
        )}
        {!loading && tasks.length === 0 && !error && (
          <div className="px-6 py-12 text-center text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-900/20">
            No tasks found. Create one to get started!
          </div>
        )}

        {/* ROWS */}
        {!loading &&
          filteredTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`group border-t border-zinc-100 dark:border-zinc-800/80 px-4 md:px-6 py-5 flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#111114] hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.02] transition-all duration-200 ${
                idx === filteredTasks.length - 1 ? 'rounded-b-2xl' : ''
              } relative ${activeDropdown?.id === task.id ? 'z-50' : 'z-auto'}`}
            >
              <div className="flex-[1.5] relative">
                {activeDropdown?.id === task.id && activeDropdown.field === 'title' ? (
                  <input
                    autoFocus
                    className="bg-white dark:bg-zinc-950 border-2 border-indigo-500 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-white w-full outline-none shadow-lg shadow-indigo-500/10"
                    value={task.title}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, title: newVal } : t));
                    }}
                    onBlur={() => handleInPlaceUpdate(task.id, 'title', task.title)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInPlaceUpdate(task.id, 'title', task.title)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p 
                    className="text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown({ id: task.id, field: 'title' });
                    }}
                  >
                    {task.title}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] text-white font-black shadow-sm">
                    {(task.assignee_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    {task.assignee_name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="flex-[1.5] relative">
                {activeDropdown?.id === task.id && activeDropdown.field === 'description' ? (
                  <textarea
                    autoFocus
                    className="bg-white dark:bg-zinc-950 border-2 border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white w-full outline-none resize-none shadow-lg shadow-indigo-500/10"
                    rows={2}
                    value={task.description || ''}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, description: newVal } : t));
                    }}
                    onBlur={() => handleInPlaceUpdate(task.id, 'description', task.description)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleInPlaceUpdate(task.id, 'description', task.description)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p 
                    className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 cursor-text transition-colors leading-relaxed"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown({ id: task.id, field: 'description' });
                    }}
                  >
                    {task.description || <span className="text-zinc-400 dark:text-zinc-600 italic font-medium">Add description...</span>}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-md uppercase tracking-[0.05em] border border-indigo-100 dark:border-indigo-500/20">
                  {task.team_name || 'General'}
                </span>
              </div>

              <div className="flex-1 relative">
                <div 
                  className={`cursor-pointer hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    task.priority === 'HIGH' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                    task.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                    'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown?.id === task.id && activeDropdown.field === 'priority' ? null : { id: task.id, field: 'priority' });
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    task.priority === 'HIGH' ? 'bg-red-500 animate-pulse' : 
                    task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  {task.priority}
                  <span className="text-[8px] opacity-40">▼</span>
                </div>
                
                {activeDropdown?.id === task.id && activeDropdown.field === 'priority' && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                      <button
                        key={p}
                        onClick={() => handleInPlaceUpdate(task.id, 'priority', p)}
                        className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 ${
                          p === 'HIGH' ? 'text-red-600 dark:text-red-400' : p === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        } ${task.priority === p ? 'bg-zinc-100 dark:bg-zinc-800/50' : ''}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${p === 'HIGH' ? 'bg-red-500' : p === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <div 
                  className={`${getStatusBadgeClass(task.status)} cursor-pointer hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 px-3 py-1.5 uppercase tracking-tighter rounded-xl !border-2`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown?.id === task.id && activeDropdown.field === 'status' ? null : { id: task.id, field: 'status' });
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    task.status === 'DONE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                    task.status === 'IN_PROGRESS' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-zinc-400'
                  }`} />
                  {task.status ? task.status.replace('_', ' ') : 'TODO'}
                  <span className="text-[8px] opacity-40">▼</span>
                </div>

                {activeDropdown?.id === task.id && activeDropdown.field === 'status' && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in duration-150" onClick={e => e.stopPropagation()}>
                    {['TODO', 'IN_PROGRESS', 'DONE'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleInPlaceUpdate(task.id, 'status', s)}
                        className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 border-none rounded-none ${
                          s === 'DONE' ? 'text-emerald-600 dark:text-emerald-400' : s === 'IN_PROGRESS' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400'
                        } ${task.status === s ? 'bg-zinc-100 dark:bg-zinc-800/50' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          s === 'TODO' ? 'bg-zinc-400' : s === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-emerald-400'
                        }`} />
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 flex md:justify-end gap-2">
                <button
                  onClick={() => handleEditClick(task)}
                  className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm"
                  title="Edit Task"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all border border-red-100 dark:border-red-900/30 shadow-sm"
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onTaskUpdated={() => fetchTasks()}
        taskToEdit={taskToEdit}
        defaultTeamId={teamFilter ? Number(teamFilter) : null}
      />
    </div>
  );
};

export default TaskList;