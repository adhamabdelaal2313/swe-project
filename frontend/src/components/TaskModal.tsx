import React, { useState, useEffect } from 'react';
import './TaskModal.css';

// Updated Interface to match your new Database Schema
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;      // 'TODO', 'IN_PROGRESS', 'DONE'
  priority: string;    // 'LOW', 'MEDIUM', 'HIGH'
  team: string;
  assignee: string;
  due_date: string;
}

interface TaskModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  onTaskUpdated: () => void; 
  taskToEdit: Task | null; 
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onTaskUpdated, taskToEdit }) => {
  // 1. STATE for all the new fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [team, setTeam] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = taskToEdit !== null;

  // 2. EFFECT: Pre-fill form when editing
  useEffect(() => {
    if (isOpen) {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setStatus(taskToEdit.status || 'TODO');
            setPriority(taskToEdit.priority || 'MEDIUM');
            setTeam(taskToEdit.team || '');
            setAssignee(taskToEdit.assignee || '');
            // Format date slightly if it exists to fit the input type="date"
            setDueDate(taskToEdit.due_date ? taskToEdit.due_date.substring(0, 10) : ''); 
        } else {
            // Reset to defaults for New Task
            setTitle('');
            setDescription('');
            setStatus('TODO');
            setPriority('MEDIUM');
            setTeam('');
            setAssignee('');
            setDueDate('');
        }
        setError(null);
    }
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  // 3. SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `http://localhost:3000/api/tasks/${taskToEdit!.id}`
        : 'http://localhost:3000/api/tasks';
      
      const method = isEditing ? 'PUT' : 'POST';

      const bodyPayload = {
        title,
        description,
        status,
        priority,
        team,
        assignee,
        due_date: dueDate
      };

      const response = await fetch(url, {
        method: method,
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
        <form onSubmit={handleSubmit}>
          
          {/* Title */}
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Title" disabled={loading} />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." rows={3} disabled={loading} />
          </div>

          {/* Row 1: Status & Priority */}
          <div className="form-row" style={{display: 'flex', gap: '15px'}}>
            <div className="form-group" style={{flex: 1}}>
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={loading}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                </select>
            </div>
            <div className="form-group" style={{flex: 1}}>
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} disabled={loading}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                </select>
            </div>
          </div>

          {/* Row 2: Team & Assignee */}
          <div className="form-row" style={{display: 'flex', gap: '15px'}}>
            <div className="form-group" style={{flex: 1}}>
                <label>Team</label>
                <input type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Design" disabled={loading} />
            </div>
            <div className="form-group" style={{flex: 1}}>
                <label>Assignee</label>
                <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Name" disabled={loading} />
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={loading} />
          </div>

          {error && <p className="error-message-modal">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading} className="cancel-button">Cancel</button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
        <button className="close-button" onClick={onClose} disabled={loading}>&times;</button>
      </div>
    </div>
  );
};

export default TaskModal;