import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import SearchBar from './SearchBar';

const Navbar = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light-theme');
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light-theme' ? 'dark-theme' : 'light-theme');
    };

    const handleLogout = async () => {
        await logout();
        window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Logged out successfully.', type: 'info' } }));
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
                Forum<span>X</span>
            </Link>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <SearchBar />
            </div>

            <div className="navbar-actions" style={{ alignItems: 'center' }}>
                {user && <NotificationDropdown />}

                <button
                    onClick={toggleTheme}
                    className="icon-btn"
                    aria-label="Toggle Dark Mode"
                    title="Toggle Theme"
                >
                    {theme === 'light-theme' ? (
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    ) : (
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    )}
                </button>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        {isAdmin && (
                            <Link to="/admin" style={{ textDecoration: 'none' }}>
                                <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', fontWeight: 700, letterSpacing: '0.5px' }}>ADMIN</span>
                            </Link>
                        )}
                        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                            <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                                {(user.username || 'U').slice(0, 2).toUpperCase()}
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="btn-cancel" style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 500 }}>Log Out</button>
                    </div>
                ) : (
                    <Link to="/login" className="btn-submit" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '14px', borderRadius: 'var(--radius-full)' }}>Sign In</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
