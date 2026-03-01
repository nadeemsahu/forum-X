import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CategoriesPage from './pages/CategoriesPage';
import ThreadsPage from './pages/ThreadsPage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import NotFound from './pages/NotFound';
import Toast from './components/Toast';
import { categories } from './data/mockData';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateThreadModal from './components/CreateThreadModal';
import AdminDashboard from './pages/AdminDashboard';
import AnnouncementBanner from './components/AnnouncementBanner';

// NEW AUTH IMPORTS
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const handleAddToast = (e) => {
      const newToast = { id: Date.now(), message: e.detail.message, type: e.detail.type };
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    };
    window.addEventListener('add-toast', handleAddToast);
    return () => window.removeEventListener('add-toast', handleAddToast);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // EMERGENCY RESET: CTRL + SHIFT + R
      if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        if (window.confirm("CRITICAL WARNING: This will completely wipe the forum database and reset all users, threads, and sessions. Are you sure you want to perform a HARD RESET?")) {
          import('./utils/localStorageDb').then(module => {
            module.hardResetDatabase();
          });
        }
        return;
      }

      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
          setIsCreateModalOpen(false);
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-layout">
      {/* We use a wildcard route for Navbar and Sidebar to hide them on auth pages if needed, but for now they render everywhere */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapper */}
        <Route path="*" element={
          <ProtectedRoute>
            <>
              <AnnouncementBanner />
              <Navbar />
              <div className="main-container">
                <Sidebar categories={categories} />
                <main style={{ flex: 1, minWidth: 0, paddingBottom: 'var(--spacing-xxxl)' }}>
                  <Routes>
                    <Route path="/" element={<CategoriesPage />} />
                    <Route path="/category/:categoryId" element={<ThreadsPage />} />
                    <Route path="/thread/:threadId" element={<ThreadDetailPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <div className="fab-container">
                <button className="fab" aria-label="Create New Post" onClick={() => setIsCreateModalOpen(true)}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
              </div>

              <CreateThreadModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
            </>
          </ProtectedRoute>
        } />
      </Routes>

      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
