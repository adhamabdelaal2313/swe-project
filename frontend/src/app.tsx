import TaskList from './components/TaskList'; 
import './App.css'; 

function App() {
  return (
    <main className="content-area">
      <h1>Tasks Dashboard</h1>
      <p>Organize and track all your team's tasks in one place.</p>
      <TaskList /> 
    </main>
  )
}

export default App