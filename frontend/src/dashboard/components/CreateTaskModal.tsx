import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../portal/Context/AuthContext';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('Sarah Chen');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dashboard/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          priority: priority.toUpperCase(), 
          assignee,
          userId: user?.id || null,
          userName: user?.name || null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      alert("Task Saved to Cloud DB!");
      setTitle('');
      onClose();
    } catch (err) {
      alert("Error saving task");
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
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 text-white rounded focus:border-indigo-500 outline-none" placeholder="Task Title..." required />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 text-white rounded">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg w-full font-medium transition-colors">Create Task</button>
        </form>
      </div>
    </div>
  );
}