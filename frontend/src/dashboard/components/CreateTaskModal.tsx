import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

// Added onTaskCreated prop for dashboard refresh
export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!title) {
        setError("Task Name is required.");
        setIsLoading(false);
        return;
    }

    try {
      // 💡 FIX 1: Correct Port to 3000
      // 💡 FIX 2: Correct Route to /task
      const response = await fetch('http://localhost:3000/api/dashboard/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Use 'title' for name and 'description' for description
        body: JSON.stringify({ 
            title: title, 
            description: description,
            // Provide safe defaults for other fields expected by the controller (Minimalist or full)
            priority: 'MEDIUM',
            assignee: 'Unassigned'
        })
      });

      if (response.ok) {
        // Successful creation
        setTitle('');
        setDescription('');
        // 💡 FIX 3: Call refresh function instead of alert()
        onTaskCreated(); 
      } else {
        // Capture specific backend error for debugging (if enhanced logging is active)
        const errorData = await response.json();
        const errorMessage = errorData.dbError || errorData.message || 'Unknown server error.';
        setError(`Failed to create task: ${errorMessage}`);
        console.error("Backend Task Error:", errorData);
      }
    } catch (err) {
      setError("Network error: Could not connect to backend server.");
      console.error("Fetch Error:", err);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 w-full max-w-md relative shadow-2xl">
         <div className="flex justify-between items-center mb-6">
             <h2 className="text-white text-xl font-bold">Create New Task</h2>
             <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={24} /></button>
          </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle size={18} />
                {error}
            </div>
          )}

          <div>
            <label className="block text-zinc-400 text-sm mb-1">Task Name</label>
            <input 
              value={title} // Use 'title' state
              onChange={e => setTitle(e.target.value)} 
              className="w-full p-2 bg-zinc-800 border border-zinc-700 text-white rounded focus:border-indigo-500 outline-none" 
              placeholder="e.g. Implement Tailwind UI" 
              required 
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full p-2 bg-zinc-800 border border-zinc-700 text-white rounded focus:border-indigo-500 outline-none h-24" 
              placeholder="Detailed description of the task requirements." 
            />
          </div>
          <button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg w-full font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}