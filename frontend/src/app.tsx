import TaskList from './components/TaskList'; 
import './App.css'; // This one is fine

function App() {
  return (
    <>
      <main className="content-area">
        <h1>Tasks Dashboard</h1>
        <p>Organize and track all your team's tasks in one place.</p>
        <TaskList /> {/* Insert the new TaskList component here */}
      </main>
    </>
  )
}

export default App
