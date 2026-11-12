import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import TrainingModule from './features/training/TrainingModule'
import './styles.css'
import './features/training/training.css'

function Application() {
  return (
    <>
      <App />
      <TrainingModule />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
)
