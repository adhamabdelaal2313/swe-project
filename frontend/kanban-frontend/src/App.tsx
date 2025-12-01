import React, { useState, useEffect } from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, X, Calendar, Trash2, WifiOff, Menu, Settings, Layout, Users 
} from 'lucide-react';

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

// --- COMPONENTS ---
const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    HIGH: 'text-red-500 border-red-900/50 bg-red-950/20',
    MEDIUM: 'text-yellow-500 border-yellow-900/50 bg-yellow-950/20',
    LOW: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 border rounded uppercase ${styles[priority]}`}>{priority}</span>;
};

// --- MAIN APP ---
export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <--- NEW STATE FOR SIDEBAR
  
  // Form State
  const [newTask, setNewTask] = useState({ 
    title: '', 
    team: 'Frontend', 
    priority: 'MEDIUM' as Priority,
    assignee: 'Unassigned',
    due_date: '2024-04-01'
  });

  // 1. GET (Read tasks)
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8081/tasks');
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

  useEffect(() => { fetchTasks(); }, []);

  // 2. POST (Create new task)
  const handleAddTask = async () => {
    if (!newTask.title) return;

    const taskPayload = {
      title: newTask.title,
      description: 'New Task', 
      status: 'TODO',
      priority: newTask.priority,
      team: newTask.team,
      assignee: newTask.assignee,
      tags: ['New'], 
      due_date: newTask.due_date
    };

    try {
      const response = await fetch('http://localhost:8081/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Server Error');
      }

      fetchTasks();
      setIsModalOpen(false);
      setNewTask({ ...newTask, title: '' });

    } catch (error) {
      alert("Error saving to database! Check your Backend Terminal for details.");
      console.error("Save failed:", error);
    }
  };

  // 3. PUT (Move Card)
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
      await fetch(`http://localhost:8081/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.warn("Update failed:", error);
      fetchTasks(); 
    }
  };

  // 4. DELETE (Remove Task)
  const deleteTask = async (taskId: number) => {
    if(!confirm("Delete this task?")) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`http://localhost:8081/tasks/${taskId}`, { method: 'DELETE' });
    } catch (error) { console.warn("Delete failed:", error); }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-6 md:p-8 relative overflow-x-hidden">
      
      {/* --- SIDEBAR OVERLAY & MENU --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
           {/* Backdrop (Click to close) */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => setIsSidebarOpen(false)}
           ></div>

           {/* Sidebar Panel */}
           <div className="relative w-64 bg-[#141414] border-r border-zinc-800 h-full p-6 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">TF</div>
                  TeamFlow
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>

              <nav className="flex-1 space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium">
                  <Layout size={18} /> Kanban Board
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm font-medium transition-colors">
                  <Users size={18} /> Team Members
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm font-medium transition-colors">
                  <Settings size={18} /> Settings
                </button>
              </nav>

              <div className="pt-6 border-t border-zinc-800 text-xs text-zinc-600">
                v1.0.0 Stable
              </div>
           </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* MENU BUTTON (Opens Sidebar) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              {isBackendOffline ? (
                <span className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs font-medium">
                  <WifiOff size={12} /> Offline Mode
                </span>
              ) : (
                <span className="text-emerald-400">● Connected to Database</span>
              )}
            </div>
          </div>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20">
          <Plus size={18}/> New Task
        </button>
      </header>

      {/* LOADING */}
      {isLoading && <div className="text-zinc-500 text-center py-10">Loading tasks...</div>}

      {/* BOARD VIEW */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
            <div key={status} className="flex flex-col gap-4">
               {/* Column Header */}
               <div className={`flex justify-between items-center p-3 rounded-lg border bg-[#141414]/50 backdrop-blur-sm ${
                 status === 'TODO' ? 'border-zinc-700' : status === 'IN_PROGRESS' ? 'border-lime-500/50' : 'border-emerald-500/50'
               }`}>
                  <h2 className="font-bold text-zinc-100 text-xs tracking-wide uppercase">{status.replace('_', ' ')}</h2>
                  <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === status).length}
                  </span>
               </div>
               
               {/* Task Cards */}
               <div className="flex flex-col gap-3 min-h-[100px]">
                 {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="group relative bg-[#141414] border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all shadow-sm hover:shadow-md">
                      {/* Hover Controls */}
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141414]/90 p-1 rounded-lg backdrop-blur-sm border border-zinc-800/50">
                         {task.status !== 'TODO' && <button onClick={() => moveTask(task.id, 'left')} className="p-1 hover:bg-zinc-700 rounded text-zinc-400"><ChevronLeft size={14}/></button>}
                         {task.status !== 'DONE' && <button onClick={() => moveTask(task.id, 'right')} className="p-1 hover:bg-zinc-700 rounded text-zinc-400"><ChevronRight size={14}/></button>}
                         <div className="w-px h-3 bg-zinc-800 mx-1 self-center"></div>
                         <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-900/30 text-red-400 rounded"><Trash2 size={14}/></button>
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">{task.team}</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <h3 className="text-zinc-100 font-semibold text-sm mb-2 leading-tight">{task.title}</h3>
                      
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        {task.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 font-medium">{tag}</span>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                            {task.assignee.charAt(0)}
                          </div>
                          {task.assignee}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium opacity-70">
                          <Calendar size={10}/> {task.due_date}
                        </div>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#141414] border border-zinc-800 w-full max-w-md rounded-xl p-6 relative shadow-2xl">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
             <h2 className="text-xl font-bold mb-6 text-white">Create New Task</h2>
             
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5 block">Task Title</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Redesign Homepage" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white outline-none focus:border-purple-600 focus:bg-zinc-900/50 transition-all placeholder:text-zinc-600"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5 block">Team</label>
                    <input 
                      placeholder="e.g. Design" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-600"
                      value={newTask.team}
                      onChange={e => setNewTask({...newTask, team: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5 block">Priority</label>
                    <select 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-600"
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1.5 block">Assignee</label>
                   <input 
                      placeholder="e.g. Sarah Chen" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white text-sm outline-none focus:border-purple-600"
                      value={newTask.assignee}
                      onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                  />
                </div>

                <button onClick={handleAddTask} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-lg mt-2 transition-all shadow-[0_0_20px_-5px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_-5px_rgba(147,51,234,0.5)]">
                  Create Task
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}