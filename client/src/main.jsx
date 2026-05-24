import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1d1b20',
            border: '1px solid #e6e0e9',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
          },
          success: { iconTheme: { primary: '#4f378a', secondary: '#ffffff' } },
          error: { iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
