import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Import CSS architecture natively
import './styles/variables.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/thread.css';
import './styles/form.css';
import { initDb } from './utils/localStorageDb';

// Initialize the local storage mock database on boot
initDb();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
