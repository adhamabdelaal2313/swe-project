import { useState, useEffect, useCallback } from 'react';
import TaskModal from './TaskModal';
import { useAuth } from '../portal/Context/AuthContext';

// Task shape returned by backend
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  team: string;
  assignee: string;
  due_date: string;
  created_at: string;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const { user } = useAuth();

  // Load all tasks from backend; search & status filtering are done client-side
  const fetchTasks = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tasks', signal ? { signal } : undefined);
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
    []
  );

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
  }, [searchQuery, fetchTasks]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          userName: user?.name || null,
        }),
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks.filter((t) => {
    // Text search across key columns
    if (normalizedQuery) {
      const haystack = [
        t.title,
        t.description,
        t.team,
        t.assignee,
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
          <h1 className="text-3xl font-bold text-white mb-1">Tasks</h1>
          <p className="text-zinc-500 text-sm">
            Browse, search, and manage all tasks across your teams.
          </p>
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
      <div className="bg-[#111114] border border-zinc-800/70 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
        {/* HEADER ROW */}
        <div className="hidden md:flex items-center px-5 py-3 bg-zinc-900/80 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          <div className="flex-[2]">Task</div>
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
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="border-t border-zinc-800/80 px-4 md:px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 bg-[#111114] hover:bg-zinc-900/60 transition-colors"
            >
              <div className="flex-[2]">
                <p className="text-sm font-semibold text-zinc-100">
                  {task.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {task.assignee || 'Unassigned'}
                </p>
              </div>

              <div className="flex-1 text-sm text-zinc-300">
                {task.team || 'General'}
              </div>

              <div className="flex-1 text-sm font-semibold">
                <span className={getPriorityClass(task.priority)}>
                  {task.priority}
                </span>
              </div>

              <div className="flex-1">
                <span className={getStatusBadgeClass(task.status)}>
                  {task.status ? task.status.replace('_', ' ') : 'TODO'}
                </span>
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
      />
    </div>
  );
};

export default TaskList;