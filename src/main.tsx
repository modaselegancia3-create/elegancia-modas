import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SacolaProvider } from './context/SacolaContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SacolaProvider>
        <App />
      </SacolaProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
