import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getAdminLogs, banUser, unbanUser, getThreads, logAdminActivity, getAnnouncement, setAnnouncement, clearAnnouncement, deleteUserAccount } from '../utils/localStorageDb';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/thread.css';

const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalThreads: 0, totalReplies: 0, bannedUsers: 0, pinnedThreads: 0, activeToday: 0 });
    const [announcementInput, setAnnouncementInput] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        const fetchAdminData = async () => {
            const fetchedUsers = await getAllUsers();
            const fetchedLogs = await getAdminLogs();
            const fetchedThreads = await getThreads();
            const currentAnnounce = await getAnnouncement();

            setUsers(fetchedUsers);
            setLogs(fetchedLogs);
            if (currentAnnounce) setAnnouncementInput(currentAnnounce);

            // Simple stat aggregation
            let totalReplies = 0;
            let pinnedThreads = 0;
            fetchedThreads.forEach(t => {
                totalReplies += t.replyCount;
                if (t.isPinned) pinnedThreads++;
            });

            const bannedUsers = fetchedUsers.filter(u => u.isBanned).length;

            // Mock active today: Just a random believable number based on user count for the design demo
            const activeToday = Math.max(1, Math.floor(fetchedUsers.length * 0.7));

            setStats({
                totalUsers: fetchedUsers.length,
                totalThreads: fetchedThreads.length,
                totalReplies,
                bannedUsers,
                pinnedThreads,
                activeToday
            });
            setLoading(false);
        };
        fetchAdminData();
    }, []);

    const handleBroadcast = async () => {
        if (!announcementInput.trim()) {
            await clearAnnouncement();
            logAdminActivity('Removed Global Announcement', 'System');
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: `Announcement isolated`, type: 'info' } }));
        } else {
            await setAnnouncement(announcementInput);
            logAdminActivity('Posted Global Announcement', announcementInput.substring(0, 20) + '...');
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: `Announcement broadcasted`, type: 'success' } }));
        }
        window.dispatchEvent(new Event('announcement-updated'));

        const fetchedLogs = await getAdminLogs();
        setLogs(fetchedLogs);
    };

    const handleBanToggle = async (targetUser) => {
        if (targetUser.id === 'u_admin') return;

        if (targetUser.isBanned) {
            await unbanUser(targetUser.id);
            logAdminActivity('Unbanned User', targetUser.username);
            const event = new CustomEvent('add-toast', { detail: { message: `Unbanned ${targetUser.username}`, type: 'success' } });
            window.dispatchEvent(event);
        } else {
            await banUser(targetUser.id);
            logAdminActivity('Banned User', targetUser.username);
            const event = new CustomEvent('add-toast', { detail: { message: `Banned ${targetUser.username}`, type: 'error' } });
            window.dispatchEvent(event);
        }

        // Refresh lists
        const fetchedUsers = await getAllUsers();
        const fetchedLogs = await getAdminLogs();
        setUsers(fetchedUsers);
        setLogs(fetchedLogs);
    };

    const handleUserDeleteRequest = (u) => {
        setUserToDelete(u);
        setIsConfirmOpen(true);
    };

    const confirmUserDelete = async () => {
        if (!userToDelete) return;

        await deleteUserAccount(userToDelete.id);
        logAdminActivity('Deleted User Account', userToDelete.username);
        window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: `Account ${userToDelete.username} deleted forever`, type: 'info' } }));

        const fetchedUsers = await getAllUsers();
        const fetchedLogs = await getAdminLogs();
        setUsers(fetchedUsers);
        setLogs(fetchedLogs);
        setUserToDelete(null);
    };

    const [userSearch, setUserSearch] = useState('');
    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()));

    const [logSearch, setLogSearch] = useState('');
    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.target.toLowerCase().includes(logSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="content-area">
                <h1 className="page-title">Admin Dashboard</h1>
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xxxl)', color: 'var(--text-secondary)' }}>Loading system data...</div>
            </div>
        );
    }

    return (
        <div className="content-area">
            <h1 className="page-title">Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xxl)', fontSize: '18px' }}>Manage platform users, monitor activity, and enforce moderation.</p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xxxl)' }}>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>👥</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.totalUsers}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Users</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>📄</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.totalThreads}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Threads</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>💬</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.totalReplies}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Content</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>🟢</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.activeToday}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Active Today</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>📌</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.pinnedThreads}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Pinned Threads</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>⛔</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px', color: '#ef4444' }}>{stats.bannedUsers}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Suspended Users</div>
                </div>
            </div>

            {/* Global Announcement Setting */}
            <div className="thread-card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xxxl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Global Announcement</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px' }}>Broadcast a message to all users across the platform. Leave this blank and click update to clear an existing announcement.</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Scheduled maintenance at 2 AM EST..."
                        value={announcementInput}
                        onChange={(e) => setAnnouncementInput(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button className="btn-submit" onClick={handleBroadcast}>Broadcast Update</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xxl)' }}>
                {/* User Management */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>User Management</h2>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            style={{ maxWidth: '250px', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
                        />
                    </div>

                    <div className="thread-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-soft)', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <div>User</div>
                            <div>Joined</div>
                            <div>Karma</div>
                            <div>Status</div>
                            <div style={{ textAlign: 'right' }}>Actions</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filteredUsers.map((u, index) => (
                                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', padding: '16px 24px', alignItems: 'center', borderBottom: index < filteredUsers.length - 1 ? '1px solid var(--border-soft)' : 'none', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '11px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                                            {(u.username || 'U').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{u.username || 'Unknown'}</div>
                                            {u.role === 'admin' && <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'var(--accent)', color: 'var(--glass-white)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>ADMIN</span>}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        {new Date(u.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>
                                        {u.karma}
                                    </div>
                                    <div>
                                        {u.isBanned ? (
                                            <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#ef444422', color: '#ef4444', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Suspended</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#22c55e22', color: '#16a34a', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Active</span>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button className="btn-action" onClick={() => window.location.href = `/#/profile/${u.username || 'unknown'}`} style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }}>
                                            Profile
                                        </button>

                                        {u.role !== 'admin' && (
                                            <>
                                                <button
                                                    className="btn-action"
                                                    onClick={() => handleBanToggle(u)}
                                                    style={{
                                                        color: u.isBanned ? 'var(--text-primary)' : '#ef4444',
                                                        backgroundColor: u.isBanned ? 'var(--bg-secondary)' : 'transparent',
                                                        border: `1px solid ${u.isBanned ? 'var(--border-strong)' : '#ef444455'}`,
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        borderRadius: 'var(--radius-full)'
                                                    }}
                                                >
                                                    {u.isBanned ? 'Unban' : 'Suspend'}
                                                </button>
                                                <button
                                                    className="btn-action"
                                                    style={{
                                                        color: '#fff',
                                                        backgroundColor: '#ef4444',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        borderRadius: 'var(--radius-full)'
                                                    }}
                                                    onClick={() => handleUserDeleteRequest(u)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Logs */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Platform Activity History</h2>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search logs..."
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                            style={{ maxWidth: '200px', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {filteredLogs.length === 0 ? (
                            <div className="thread-card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>No matching activity found.</div>
                        ) : (
                            filteredLogs.slice(0, 15).map((log, index) => (
                                <div key={log.id} style={{ padding: 'var(--spacing-md)', borderBottom: index < filteredLogs.length - 1 ? '1px solid var(--border-soft)' : 'none', display: 'flex', gap: 'var(--spacing-md)', fontSize: '14px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span style={{ fontWeight: 600 }}>{log.action}</span>
                                    <span>{log.target}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmUserDelete}
                title="Delete User Account"
                message={`Are you sure you want to permanently obliterate ${userToDelete?.username}? This action is irreversible and strips all presence from the platform.`}
                confirmText="Permanently Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default AdminDashboard;
