import { useState, useEffect, useCallback } from 'react';
import TaskModal from './TaskModal';
import './TaskList.css';

// Updated Interface
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

  // NEW: State for the search box input
  const [searchQuery, setSearchQuery] = useState('');
  // Fetch Logic is updated to include search query
  const fetchTasks = useCallback(async (currentQuery: string, signal: AbortSignal) => {
    setLoading(true);
    setError(null);

    let url = 'http://localhost:3000/api/tasks';
    
    // Check if we have a search term and append it to the URL
    if (currentQuery) {
        url += `?search=${encodeURIComponent(currentQuery)}`;
    }

    try {
      const response = await fetch(url, { signal }); // Attach the signal to the fetch request
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (e: any) {
      // Ignore the error if it was caused by the fetch being intentionally aborted (cleanup)
      if (e.name !== 'AbortError') {
          setError('Failed to fetch tasks: ' + e.message);
          setTasks([]); // Clear tasks on error
      }
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are now removed from here, moving them to useEffect

  // The effect handles the fetching and cleanup
  useEffect(() => {
    // 1. Setup AbortController for cleanup
    const controller = new AbortController();
    const signal = controller.signal;

    // 2. Debounce: Wait 300ms before fetching
    const handler = setTimeout(() => {
        // Use the current value of searchQuery state (captured by the effect)
        fetchTasks(searchQuery, signal);
    }, 300); 

    // 3. Cleanup function: This runs when the component unmounts OR when the dependencies (searchQuery) change.
    return () => {
        clearTimeout(handler); // Clear the debounce timer
        controller.abort();    // Cancel any ongoing fetch request
    };
  }, [searchQuery, fetchTasks]); // Rerun whenever searchQuery or fetchTasks changes

  // Delete Logic (Remains the same)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
        await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE' });
        fetchTasks(); 
    } catch (e: any) { alert('Failed to delete task: ' + e.message); }
  };

  // Modal Handlers (Remains the same)
  const handleEditClick = (task: Task) => { setTaskToEdit(task); setIsModalOpen(true); };
  const handleCreateClick = () => { setTaskToEdit(null); setIsModalOpen(true); }
  const handleModalClose = () => { setIsModalOpen(false); setTaskToEdit(null); };

  // Helper for Status Color (Remains the same)
  const getStatusBadgeClass = (status: string) => {
      if (!status) return 'status-badge';
      return `status-badge ${status.toLowerCase().replace('_', '-')}`;
  };

  // Helper for Priority Color (Remains the same)
  const getPriorityColor = (priority: string) => {
      if (priority === 'HIGH') return '#ff6f61';
      if (priority === 'MEDIUM') return '#ff9800';
      return '#4caf50';
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="search-bar">
          {/* NEW: Connect input to searchQuery state */}
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="search-icon">🔍</i> 
        </div>
        <button className="new-task-button" onClick={handleCreateClick}>+ New Task</button>
      </div>

      <div className="task-filters">
        <span className="filter-item active">All ({tasks.length})</span>
        <span className="filter-item">To Do ({tasks.filter(t => t.status === 'TODO').length})</span>
        <span className="filter-item">In Progress ({tasks.filter(t => t.status === 'IN_PROGRESS').length})</span>
        <span className="filter-item">Done ({tasks.filter(t => t.status === 'DONE').length})</span>
      </div>

      <div className="task-table-wrapper">
        <div className="task-row header">
          <div className="col-title" style={{flex: 2}}>Task</div>
          <div className="col-status" style={{flex: 1}}>Team</div>
          <div className="col-status" style={{flex: 1}}>Priority</div>
          <div className="col-status" style={{flex: 1}}>Status</div>
          <div className="col-actions" style={{flex: 1}}>Actions</div>
        </div>

        {loading && <p className="loading-message">Loading tasks...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && tasks.length === 0 && !error && <p className="no-tasks-message">No tasks found.</p>}

        {!loading && tasks.map(task => (
          <div key={task.id} className="task-row data-row">
            <div className="col-title" style={{flex: 2}}>
                <strong>{task.title}</strong>
                <br/>
                <span style={{fontSize: '0.85em', color: '#777'}}>{task.assignee}</span>
            </div>
            <div className="col-status" style={{flex: 1}}>{task.team}</div>
            <div className="col-status" style={{flex: 1}}>
                <span style={{color: getPriorityColor(task.priority), fontWeight: 'bold'}}>
                    {task.priority}
                </span>
            </div>
            <div className="col-status" style={{flex: 1}}>
              <span className={getStatusBadgeClass(task.status)}>
                {task.status ? task.status.replace('_', ' ') : 'TODO'}
              </span>
            </div>
            <div className="col-actions" style={{flex: 1}}>
              <button className="action-button edit" onClick={() => handleEditClick(task)}>✏️</button>
              <button className="action-button delete" onClick={() => handleDelete(task.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        onTaskUpdated={fetchTasks} 
        taskToEdit={taskToEdit} 
      />
    </div>
  );
};

export default TaskList;