import './features/auth/auth.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import TrainingModule from './features/training/TrainingModule'
import CoachModule from './features/coach/CoachModule'
import AuthModule from './features/auth/AuthModule'
import './styles.css'
import './features/training/training.css'

function Application() {
  return <><App /><TrainingModule /><CoachModule /><AuthModule /></>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Application /></React.StrictMode>,)
