import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PlanProvider } from './context/PlanContext';
import { App } from './App';
import './styles.css';
import { initSentry } from './config/sentry';

initSentry();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <PlanProvider>
        <App />
        <Toaster position="top-right" />
      </PlanProvider>
    </AuthProvider>
  </React.StrictMode>
);
