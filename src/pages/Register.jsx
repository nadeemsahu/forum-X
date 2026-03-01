import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    // Initialize Theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark-theme' || savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-theme');
            setIsDark(true);
        } else {
            document.body.classList.remove('dark-theme');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
            setIsDark(false);
        } else {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            setIsDark(true);
        }
    };

    const triggerError = (msg) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;

        if (username.length < 3) {
            triggerError('Username must be at least 3 characters');
            return;
        }
        if (password.length < 4) {
            triggerError('Password must be at least 4 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await signup(username, password);
            setSuccess(true);
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: `Account created! Welcome ${username}.`, type: 'success' } }));
                navigate('/');
            }, 600);
        } catch (err) {
            setLoading(false);
            triggerError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-page-container">
            {/* Dark Mode Toggle */}
            <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
                {isDark ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                )}
            </button>

            {/* Register Card */}
            <div className={`auth-card ${shake ? 'shake' : ''} ${success ? 'success-anim' : ''}`}>

                <div className="auth-header">
                    <div className="auth-logo">Forum<span>X</span></div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join the ForumX community</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="auth-input"
                            value={username}
                            onChange={(e) => { setUsername(e.target.value); setError(''); }}
                            placeholder="Choose a username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="auth-input"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Password (min 4 char)"
                            autoComplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={loading || success}>
                        {loading ? (
                            <div className="auth-spinner"></div>
                        ) : success ? (
                            "Success"
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
