import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar, Trash2, X, WifiOff } from 'lucide-react';

// --- TYPES ---
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

interface User {
  id: number;
  name: string;
}

interface Team {
  team_id: number;
  team_name: string;
}

// --- BADGE COMPONENT ---
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    HIGH: 'text-red-400 border-red-900/50 bg-red-950/30',
    MEDIUM: 'text-orange-400 border-orange-900/50 bg-orange-950/30',
    LOW: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 border rounded uppercase ${styles[priority]}`}>{priority}</span>;
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'TODO' as Status,
    priority: 'MEDIUM' as Priority,
    team: '',
    assignee: '',
    due_date: ''
  });

  // --- 1. FETCH DATA (Tasks, Users, Teams) ---
  const fetchAllData = async () => {
    try {
      // 1. Get Tasks
      const tasksRes = await fetch('http://localhost:8080/api/tasks');
      if (tasksRes.ok) setTasks(await tasksRes.json());

      // 2. Get Users (For Assignee Dropdown)
      const usersRes = await fetch('http://localhost:8080/api/users');
      if (usersRes.ok) setAvailableUsers(await usersRes.json());

      // 3. Get Teams (For Team Dropdown)
      const teamsRes = await fetch('http://localhost:8080/api/teams');
      if (teamsRes.ok) setAvailableTeams(await teamsRes.json());

    } catch (err) {
      console.error("Connection Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- 2. CREATE TASK ---
  const handleCreateTask = async () => {
    if (!newTask.title) return;

    try {
      const res = await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTask({
          title: '', description: '', status: 'TODO', priority: 'MEDIUM',
          team: '', assignee: '', due_date: ''
        });
        fetchAllData(); // Refresh board to show new task
      }
    } catch (err) {
      alert("Failed to create task. Is the backend running on port 8080?");
    }
  };

  // --- 3. MOVE TASK ---
  const moveTask = async (taskId: number, direction: 'left' | 'right') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const statusOrder: Status[] = ['TODO', 'IN_PROGRESS', 'DONE'];
    const currentIdx = statusOrder.indexOf(task.status);
    const newIdx = direction === 'right' ? Math.min(currentIdx + 1, 2) : Math.max(currentIdx - 1, 0);
    const newStatus = statusOrder[newIdx];

    if (newStatus === task.status) return;

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) { fetchAllData(); }
  };

  // --- 4. DELETE TASK ---
  const deleteTask = async (id: number) => {
    if(!confirm("Delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    await fetch(`http://localhost:8080/api/tasks/${id}`, { method: 'DELETE' });
  };

  if (isLoading) return <div className="text-zinc-500 p-10 text-center">Loading Board...</div>;

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto bg-[#09090b]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Kanban Board</h1>
          <p className="text-zinc-500 text-sm">Manage tasks and track progress</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* BOARD COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
          <div key={status} className="flex flex-col gap-4">
            <div className={`flex justify-between items-center p-3 rounded-lg border bg-[#141414]/50 backdrop-blur-sm ${
              status === 'TODO' ? 'border-zinc-700' : status === 'IN_PROGRESS' ? 'border-orange-500/50' : 'border-emerald-500/50'
            }`}>
              <h2 className="font-bold text-zinc-100 text-xs tracking-wide uppercase">{status.replace('_', ' ')}</h2>
              <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[100px]">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="group relative bg-[#18181b] border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all shadow-sm">
                  {/* Hover Controls */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#18181b] p-1 rounded-lg border border-zinc-700">
                    {task.status !== 'TODO' && <button onClick={() => moveTask(task.id, 'left')} className="p-1 hover:bg-zinc-700 rounded text-zinc-400"><ChevronLeft size={14}/></button>}
                    {task.status !== 'DONE' && <button onClick={() => moveTask(task.id, 'right')} className="p-1 hover:bg-zinc-700 rounded text-zinc-400"><ChevronRight size={14}/></button>}
                    <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-900/30 text-red-400 rounded"><Trash2 size={14}/></button>
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{task.team}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <h3 className="text-zinc-100 font-semibold text-sm mb-2 leading-snug">{task.title}</h3>
                  <p className="text-zinc-500 text-xs mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-white">
                        {task.assignee ? task.assignee.charAt(0) : '?'}
                      </div>
                      <span>{task.assignee || 'Unassigned'}</span>
                    </div>
                    {task.due_date && <div className="flex items-center gap-1 text-[10px]"><Calendar size={10}/> {task.due_date}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- CREATE TASK MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-zinc-700 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Title</label>
                <input 
                  autoFocus
                  placeholder="Task Title" 
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1] transition-colors placeholder:text-zinc-600"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea 
                  placeholder="Details..." 
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1] h-24 resize-none placeholder:text-zinc-600"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Status</label>
                  <select 
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1]"
                    value={newTask.status}
                    onChange={e => setNewTask({...newTask, status: e.target.value as Status})}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Priority</label>
                  <select 
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1]"
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                  >
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC DROPDOWNS: Team & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Team</label>
                  <select 
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1]"
                    value={newTask.team}
                    onChange={e => setNewTask({...newTask, team: e.target.value})}
                  >
                    <option value="">Select Team</option>
                    {availableTeams.map(t => (
                      <option key={t.team_id} value={t.team_name}>{t.team_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Assignee</label>
                  <select 
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1]"
                    value={newTask.assignee}
                    onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block">Due Date</label>
                <input 
                  type="date"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-[#6366F1] [color-scheme:dark]"
                  value={newTask.due_date}
                  onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTask} 
                  className="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Create Task
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}