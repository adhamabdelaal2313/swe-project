<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
=======
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.tsx'
import './index.css' // <--- IF THIS IS MISSING, IT WILL NEVER WORK

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
>>>>>>> bd9139b48f13aa53170d743a253a4ca230691792
