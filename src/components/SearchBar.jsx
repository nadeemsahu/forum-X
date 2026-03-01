import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchContent } from '../utils/localStorageDb';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Debounce search
    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            setOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            setOpen(true);
            const data = await searchContent(query);
            setResults(data);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Also close on escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleResultClick = (path) => {
        setOpen(false);
        setQuery('');
        navigate(path);
    };

    return (
        <div ref={wrapperRef} className="search-container" style={{ position: 'relative', width: '300px' }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => query.trim() && setOpen(true)}
                className="search-input"
                placeholder="Search..."
            />
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px', pointerEvents: 'none' }}>
                <kbd style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-soft)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Ctrl</kbd>
                <kbd style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-soft)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>K</kbd>
            </div>

            {open && (
                <div className="post-main" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '8px', padding: 0, zIndex: 100, overflow: 'hidden', animation: 'slideDown 0.2s ease-out' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</div>
                    ) : results ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {results.threads.length === 0 && results.users.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>No results found</div>
                            ) : (
                                <>
                                    {results.users.length > 0 && (
                                        <div>
                                            <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', backgroundColor: 'var(--bg-secondary)' }}>Users</div>
                                            {results.users.map(u => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => handleResultClick(`/profile/${u.username}`)}
                                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="avatar-circle" style={{ width: '24px', height: '24px', fontSize: '10px', backgroundColor: 'var(--accent)' }}>{(u.username || 'U').slice(0, 2).toUpperCase()}</div>
                                                    <span>{u.username || 'Unknown'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {results.threads.length > 0 && (
                                        <div>
                                            <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', backgroundColor: 'var(--bg-secondary)' }}>Threads</div>
                                            {results.threads.map(t => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => handleResultClick(`/thread/${t.id}`)}
                                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-soft)' }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div style={{ fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>by {t.author || 'Unknown'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
