import React, { useState, useEffect } from 'react';
import { useAuth } from '../portal/Context/AuthContext';

// Task shape shared with TaskList
interface Task {
  id: number;
  title: string;
  description: string;
  status: string; 
  priority: string;
  team_id: number | null;
  assignee_id: number | null;
  tags: string[];
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
  defaultTeamId?: number | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onTaskUpdated,
  taskToEdit,
  defaultTeamId = null
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');

  const [teams, setTeams] = useState<TeamOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = taskToEdit !== null;
  const { fetchWithAuth, user } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'TODO');
      setPriority(taskToEdit.priority || 'MEDIUM');
      setTeamId(taskToEdit.team_id);
      setAssigneeId(taskToEdit.assignee_id);
      setDueDate(taskToEdit.due_date ? String(taskToEdit.due_date).substring(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setTeamId(defaultTeamId);
      setAssigneeId(null);
      setDueDate('');
    }
    setError(null);
  }, [isOpen, taskToEdit, defaultTeamId]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTeams = async () => {
      try {
        const res = await fetchWithAuth('/api/teams');
        if (!res.ok) return;
        const data = await res.json();
        setTeams(
          data.map((t: any) => ({
            id: t.id,
            title: t.title,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch teams', err);
      }
    };

    fetchTeams();
  }, [isOpen, fetchWithAuth]);

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
        team_id: teamId,
        assignee_id: assigneeId,
        due_date: dueDate,
        tags: taskToEdit?.tags || []
      };

      const response = await fetchWithAuth(url, {
        method,
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
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              disabled={loading}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details..."
              rows={3}
              disabled={loading}
              className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Status</label>
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
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Priority</label>
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

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Team</label>
              <select
                value={teamId || ''}
                onChange={(e) => setTeamId(e.target.value ? Number(e.target.value) : null)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none"
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Assignee</label>
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : null)}
                disabled={loading}
                className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none"
              >
                <option value="">Unassigned</option>
                {/* Normally we'd fetch users here too */}
                {user && <option value={user.id}>{user.name} (You)</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Due Date</label>
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
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-colors disabled:opacity-50"
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
