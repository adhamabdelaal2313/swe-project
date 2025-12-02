import React, { useState, useEffect } from 'react';
import { useAuth } from '../portal/Context/AuthContext';

// Task shape shared with TaskList
interface Task {
  id: number;
  title: string;
  description: string;
  status: string; // 'TODO', 'IN_PROGRESS', 'DONE'
  priority: string; // 'LOW', 'MEDIUM', 'HIGH'
  team: string;
  assignee: string;
  due_date: string;
}

interface TeamOption {
  id: number;
  title: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  taskToEdit: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onTaskUpdated,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [team, setTeam] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [teams, setTeams] = useState<TeamOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = taskToEdit !== null;
  const { user } = useAuth();

  // Prefill fields when editing / opening
  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'TODO');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setTeam(taskToEdit.team || '');
      setAssignee(taskToEdit.assignee || '');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.substring(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setTeam('');
      setAssignee('');
      setDueDate('');
    }
    setError(null);
  }, [isOpen, taskToEdit]);

  // Load teams for dropdown so tasks always stay in sync with Teams section
  useEffect(() => {
    if (!isOpen) return;

    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams');
        if (!res.ok) return;
        const data = await res.json();
        setTeams(
          data.map((t: any) => ({
            id: t.id,
            title: t.title,
          }))
        );
      } catch {
        // Silent fail: we can still allow free-text team if API fails
      }
    };

    fetchTeams();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/tasks/${taskToEdit!.id}` : '/api/tasks';
      const method = isEditing ? 'PUT' : 'POST';

      const bodyPayload = {
        title,
        description,
        status,
        priority,
        team,
        assignee,
        due_date: dueDate,
        userId: user?.id || null,
        userName: user?.name || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} task.`);
      }

      onTaskUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-zinc-800 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white text-xl transition-colors"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-zinc-800/50">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              disabled={loading}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details..."
              rows={3}
              disabled={loading}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Status & Priority */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Team & Assignee */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
                Team
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none"
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
                Assignee
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Name"
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={loading}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark] disabled:opacity-50"
            />
          </div>

          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/50 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;