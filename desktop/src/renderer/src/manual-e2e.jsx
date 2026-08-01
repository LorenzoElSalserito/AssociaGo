import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css';
import './i18n';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ManualDashboard from './components/ManualDashboard';

createRoot(document.getElementById('root')).render(<ManualDashboard />);
