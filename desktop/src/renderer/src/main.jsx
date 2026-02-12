import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css'
import './i18n'; // Import i18n configuration

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import UserActionTracker from './components/UserActionTracker'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UserActionTracker>
        <App />
      </UserActionTracker>
    </HashRouter>
  </StrictMode>
)
