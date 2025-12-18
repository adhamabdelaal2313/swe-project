import { useState, useEffect, useCallback } from 'react';
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
    <div className="w-full bg-[#09090b] text-zinc-100 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white mb-1">Tasks</h1>
            {teamFilter && (
              <span className="px-2 py-0.5 bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                {activeTeamName || 'Team Filter Active'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-zinc-500 text-sm">
              Browse, search, and manage all tasks across your teams.
            </p>
            {teamFilter && (
              <button 
                onClick={() => setSearchParams({})}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-medium underline cursor-pointer"
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
              className="w-full bg-[#09090b] border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-colors whitespace-nowrap"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-zinc-800 pb-3 text-xs md:text-sm">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-zinc-800/70 text-indigo-400 border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          All ({tasks.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('TODO')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'TODO'
              ? 'bg-zinc-800/70 text-indigo-400 border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          To Do ({tasks.filter((t) => t.status === 'TODO').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-zinc-800/70 text-indigo-400 border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          In Progress ({tasks.filter((t) => t.status === 'IN_PROGRESS').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('DONE')}
          className={`px-3 py-1 rounded-full border transition-colors ${
            statusFilter === 'DONE'
              ? 'bg-zinc-800/70 text-indigo-400 border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          Done ({tasks.filter((t) => t.status === 'DONE').length})
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#111114] border border-zinc-800/70 rounded-2xl shadow-lg shadow-black/40">
        <div className="hidden md:flex items-center px-5 py-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wide rounded-t-2xl">
          <div className="flex-[1.5]">Task</div>
          <div className="flex-[1.5]">Description</div>
          <div className="flex-1">Team</div>
          <div className="flex-1">Priority</div>
          <div className="flex-1">Status</div>
          <div className="flex-1 text-right">Actions</div>
        </div>

        {/* STATES */}
        {loading && (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">
            Loading tasks...
          </div>
        )}
        {error && (
          <div className="px-5 py-8 text-center text-sm text-red-400">
            {error}
          </div>
        )}
        {!loading && tasks.length === 0 && !error && (
          <div className="px-5 py-8 text-center text-sm text-zinc-500">
            No tasks found.
          </div>
        )}

        {/* ROWS */}
        {!loading &&
          filteredTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`border-t border-zinc-800/80 px-4 md:px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 bg-[#111114] hover:bg-zinc-900/60 transition-colors ${
                idx === filteredTasks.length - 1 ? 'rounded-b-2xl' : ''
              }`}
            >
              <div className="flex-[1.5] relative">
                {activeDropdown?.id === task.id && activeDropdown.field === 'title' ? (
                  <input
                    autoFocus
                    className="bg-zinc-950 border border-indigo-500 rounded px-2 py-1 text-sm text-white w-full outline-none"
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
                    className="text-sm font-semibold text-zinc-100 cursor-text hover:text-indigo-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown({ id: task.id, field: 'title' });
                    }}
                  >
                    {task.title}
                  </p>
                )}
                <p className="text-xs text-zinc-500 mt-0.5">
                  {task.assignee_name || 'Unassigned'}
                </p>
              </div>

              <div className="flex-[1.5] relative">
                {activeDropdown?.id === task.id && activeDropdown.field === 'description' ? (
                  <textarea
                    autoFocus
                    className="bg-zinc-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white w-full outline-none resize-none"
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
                    className="text-xs text-zinc-400 line-clamp-2 cursor-text hover:text-indigo-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown({ id: task.id, field: 'description' });
                    }}
                  >
                    {task.description || <span className="text-zinc-600 italic">No description</span>}
                  </p>
                )}
              </div>

              <div className="flex-1 text-sm text-zinc-300">
                {task.team_name || 'General'}
              </div>

              <div className="flex-1 text-sm font-semibold relative">
                <div 
                  className={`cursor-pointer hover:brightness-125 transition-all inline-flex items-center gap-1.5 ${getPriorityClass(task.priority)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown?.id === task.id && activeDropdown.field === 'priority' ? null : { id: task.id, field: 'priority' });
                  }}
                >
                  {task.priority}
                  <span className="text-[8px] opacity-50 translate-y-[0.5px]">▼</span>
                </div>
                
                {activeDropdown?.id === task.id && activeDropdown.field === 'priority' && (
                  <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[110] overflow-hidden" onClick={e => e.stopPropagation()}>
                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                      <button
                        key={p}
                        onClick={() => handleInPlaceUpdate(task.id, 'priority', p)}
                        className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-zinc-800 transition-colors ${getPriorityClass(p)} ${task.priority === p ? 'bg-zinc-800/50' : ''}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <div 
                  className={`${getStatusBadgeClass(task.status)} cursor-pointer hover:opacity-80 transition-all items-center gap-1.5`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown?.id === task.id && activeDropdown.field === 'status' ? null : { id: task.id, field: 'status' });
                  }}
                >
                  {task.status ? task.status.replace('_', ' ') : 'TODO'}
                  <span className="text-[8px] opacity-50 translate-y-[0.5px]">▼</span>
                </div>

                {activeDropdown?.id === task.id && activeDropdown.field === 'status' && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-[110] overflow-hidden" onClick={e => e.stopPropagation()}>
                    {['TODO', 'IN_PROGRESS', 'DONE'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleInPlaceUpdate(task.id, 'status', s)}
                        className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-zinc-800 transition-colors ${getStatusBadgeClass(s)} border-none rounded-none w-full flex items-center gap-2 ${task.status === s ? 'bg-zinc-800/50' : ''}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          s === 'TODO' ? 'bg-zinc-400' : s === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-emerald-400'
                        }`}></div>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 flex md:justify-end gap-2 pt-1 md:pt-0">
                <button
                  onClick={() => handleEditClick(task)}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-red-900/40 hover:bg-red-800/60 text-red-300 transition-colors"
                >
                  Delete
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