import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationsRead } from '../utils/localStorageDb';
import { formatTime } from '../utils/formatTime';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (user) {
            const data = getNotifications(user.username);
            setNotifs(data);
        }
    }, [user, open]); // Refresh on open

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = () => {
        setOpen(!open);
        if (!open && user && notifs.some(n => !n.read)) {
            // mark read async
            setTimeout(() => {
                markNotificationsRead(user.username);
                setNotifs(prev => prev.map(n => ({ ...n, read: true })));
            }, 1000);
        }
    };

    if (!user) return null;

    const unreadCount = notifs.filter(n => !n.read).length;

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <button onClick={handleOpen} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', position: 'relative' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="post-main" style={{ position: 'absolute', top: '100%', right: 0, width: '320px', padding: 0, marginTop: '8px', zIndex: 100, overflow: 'hidden', animation: 'slideDown 0.2s ease-out' }}>
                    <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifs.length === 0 ? (
                            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notifs.map(n => (
                                <div key={n.id} style={{ padding: 'var(--spacing-md) var(--spacing-lg)', borderBottom: '1px solid var(--border-soft)', backgroundColor: n.read ? 'transparent' : 'rgba(37, 99, 235, 0.05)' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{n.message}</p>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTime(n.timestamp)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
