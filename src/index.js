import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { AuthProvider } from './context/AuthContext'; // ✅ import this

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ wrap everything inside */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
