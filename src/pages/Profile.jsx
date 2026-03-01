import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserStats, getThreads } from '../utils/localStorageDb';
import Skeleton from '../components/Skeleton';
import ThreadCard from '../components/ThreadCard';

const Profile = () => {
    const { username } = useParams();
    const [stats, setStats] = useState(null);
    const [recentThreads, setRecentThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userStats = await getUserStats(username);
                setStats(userStats);

                const threads = await getThreads();
                const userThreads = threads.filter(t => t.author === username);
                setRecentThreads(userThreads.slice(0, 5));
            } catch (e) {
                setError('User not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="content-area">
                <Skeleton height="150px" borderRadius="var(--radius-lg)" style={{ marginBottom: 'var(--spacing-xl)' }} />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="content-area" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h1 className="page-title">{error}</h1>
                <Link to="/" className="btn-action" style={{ display: 'inline-block' }}>Go Home</Link>
            </div>
        );
    }

    const avatarColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const safeUsername = stats.username || 'Unknown';
    const charCode = (safeUsername.charCodeAt(0) || 0) + (safeUsername.charCodeAt(1) || 0) || 0;
    const color = avatarColors[charCode % avatarColors.length];
    const initials = safeUsername.slice(0, 2).toUpperCase();

    return (
        <div className="content-area">
            {/* Banner Profile Card */}
            <div className="post-main" style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'center', marginBottom: 'var(--spacing-xxl)' }}>
                <div className="avatar-circle" style={{ width: '80px', height: '80px', fontSize: '32px', backgroundColor: color, boxShadow: 'var(--shadow-hover)' }}>
                    {initials}
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 'var(--font-size-xxl)', margin: 0, marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {safeUsername}
                        {safeUsername.toLowerCase() === 'admin' && (
                            <span style={{ fontSize: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', verticalAlign: 'middle', letterSpacing: '1px' }}>Admin</span>
                        )}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                        Joined {new Date(stats.joinedAt).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', marginTop: '8px', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{stats.threadCount}</strong> Threads</span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{stats.replyCount}</strong> Replies</span>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <p style={{ margin: 0, fontStyle: stats.bio ? 'normal' : 'italic', color: stats.bio ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {stats.bio || 'This user is mysterious and has no bio.'}
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-xxxl)', fontWeight: 800, color: 'var(--accent)' }}>{stats.karma || 0}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Likes</div>
                </div>
            </div>

            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-xl)' }}>{stats.username}'s Threads ({stats.threadCount} Total)</h3>
            {recentThreads.length > 0 ? (
                <div className="thread-list">
                    {recentThreads.map(t => <ThreadCard key={t.id} thread={t} />)}
                </div>
            ) : (
                <div style={{ padding: 'var(--spacing-xxl)', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-soft)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>This user hasn't posted any threads yet.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
