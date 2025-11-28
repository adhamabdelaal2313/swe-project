import { useState, useEffect } from 'react'; // <-- IMPORT HOOKS
import './TaskList.css';

// Define the type for a Task object (good practice in TypeScript)
interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: 0 | 1;
  created_at: string;
}

const TaskList = () => {
  // 1. STATE: Where we store the list of tasks after fetching
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. EFFECT: Code that runs once when the component first loads
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // API CALL: Fetch data from your running backend server
        const response = await fetch('http://localhost:3000/api/tasks');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Task[] = await response.json();
        setTasks(data); // Put the fetched data into the state
      } catch (e: any) {
        setError('Failed to fetch tasks from API: ' + e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []); // The empty array [] ensures this runs only ONCE

  // Helper function to convert MySQL's 0/1 to a display status
  const getStatusDisplay = (isCompleted: 0 | 1) => {
    return isCompleted ? 'Done' : 'To Do';
  };

  // 3. RENDER: The visual part of the component
  return (
    <div className="task-list-container">
      {/* Header Row (Search and Button) - unchanged */}
      <div className="task-list-header">
        <div className="search-bar">
          <input type="text" placeholder="Search tasks..." />
          <i className="search-icon">🔍</i> 
        </div>
        <button className="new-task-button">
          + New Task
        </button>
      </div>

      {/* Task Filters */}
      <div className="task-filters">
        <span className="filter-item active">All ({tasks.length})</span>
        <span className="filter-item">To Do ({tasks.filter(t => t.is_completed === 0).length})</span>
        <span className="filter-item">Done ({tasks.filter(t => t.is_completed === 1).length})</span>
      </div>

      {/* Task Table */}
      <div className="task-table-wrapper">
        {/* Table Header Row */}
        <div className="task-row header">
          <div className="col-title">Task</div>
          <div className="col-status">Status</div>
          <div className="col-date">Date Added</div>
          <div className="col-actions">Actions</div>
        </div>

        {/* Conditional Loading/Error Messages */}
        {loading && <p className="loading-message">Loading tasks...</p>}
        {error && <p className="error-message">Error: {error}</p>}

        {/* Loop through the fetched tasks */}
        {!loading && tasks.length === 0 && !error && (
          <p className="no-tasks-message">You have no tasks! Click '+ New Task' to start.</p>
        )}

        {!loading && tasks.map(task => (
          <div key={task.id} className="task-row data-row">
            <div className="col-title">{task.title}</div>
            <div className="col-status">
              <span className={`status-badge ${getStatusDisplay(task.is_completed).toLowerCase().replace(' ', '-')}`}>
                {getStatusDisplay(task.is_completed)}
              </span>
            </div>
            <div className="col-date">{new Date(task.created_at).toLocaleDateString()}</div>
            <div className="col-actions">
              <button className="action-button edit">✏️</button>
              <button className="action-button delete">🗑️</button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default TaskList;