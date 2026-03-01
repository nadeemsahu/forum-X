import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStats, saveUserBio, getThreads } from '../utils/localStorageDb';
import Skeleton from '../components/Skeleton';
import ThreadCard from '../components/ThreadCard';

const Dashboard = () => {
    const { user, login } = useAuth(); // getting login to potentially refresh user context 
    const [stats, setStats] = useState(null);
    const [recentThreads, setRecentThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bio Editing State
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            if (user?.username) {
                try {
                    const userStats = await getUserStats(user.username);
                    setStats(userStats);
                    setBioText(userStats.bio);

                    const threads = await getThreads();
                    const userThreads = threads.filter(t => t.author === user.username);
                    setRecentThreads(userThreads.slice(0, 3)); // top 3 recent

                } catch (e) { console.error(e) }
            }
            setLoading(false);
        };
        fetchDashboard();
    }, [user]);

    const handleSaveBio = async () => {
        try {
            await saveUserBio(user.id, bioText);
            setIsEditingBio(false);
            // Fire generic toast
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Bio updated!', type: 'success' } }));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading || !stats) {
        return (
            <div className="content-area">
                <Skeleton height="150px" borderRadius="var(--radius-lg)" style={{ marginBottom: 'var(--spacing-xl)' }} />
                <Skeleton height="200px" borderRadius="var(--radius-lg)" />
            </div>
        );
    }

    const avatarColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const safeUsername = user?.username || 'Unknown';
    const charCode = (safeUsername.charCodeAt(0) || 0) + (safeUsername.charCodeAt(1) || 0) || 0;
    const color = avatarColors[charCode % avatarColors.length];
    const initials = safeUsername.slice(0, 2).toUpperCase();

    return (
        <div className="content-area">
            <h1 className="page-title">My Dashboard</h1>

            {/* Banner Profile Card */}
            <div className="post-main" style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center', marginBottom: 'var(--spacing-xxl)' }}>
                <div className="avatar-circle" style={{ width: '80px', height: '80px', fontSize: '32px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 'var(--font-size-xxl)', margin: 0, marginBottom: 'var(--spacing-sm)' }}>{safeUsername}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                        Joined {new Date(stats.joinedAt).toLocaleDateString()}
                    </p>

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        {isEditingBio ? (
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <input
                                    type="text"
                                    value={bioText}
                                    onChange={e => setBioText(e.target.value)}
                                    className="post-textarea"
                                    style={{ minHeight: '40px', padding: '8px 12px', flex: 1 }}
                                    autoFocus
                                />
                                <button className="btn-submit" onClick={handleSaveBio} style={{ padding: '8px 16px' }}>Save</button>
                                <button className="btn-cancel" onClick={() => { setIsEditingBio(false); setBioText(stats.bio); }}>Cancel</button>
                            </div>
                        ) : (
                            <p style={{ margin: 0, fontStyle: stats.bio ? 'normal' : 'italic', color: stats.bio ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {stats.bio || 'No bio yet. Click the edit button to add one.'}
                                <button onClick={() => setIsEditingBio(true)} style={{ marginLeft: 'var(--spacing-md)', fontSize: '12px', color: 'var(--accent)', textDecoration: 'underline' }}>Edit Bio</button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xxxl)' }}>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyCenter: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>✨</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.karma}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Total Karma</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyCenter: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>📄</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.threadCount}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Threads Created</div>
                </div>
                <div className="thread-card" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center', justifyCenter: 'center', textAlign: 'center', padding: '32px 16px' }}>
                    <span style={{ fontSize: '28px', marginBottom: '8px' }}>💬</span>
                    <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>{stats.replyCount}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Replies Posted</div>
                </div>
            </div>

            {/* Recent Activity */}
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-xl)' }}>Recent Threads</h3>
            {recentThreads.length > 0 ? (
                <div className="thread-list">
                    {recentThreads.map(t => <ThreadCard key={t.id} thread={t} />)}
                </div>
            ) : (
                <div style={{ padding: 'var(--spacing-xxl)', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-soft)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't posted any threads yet.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
