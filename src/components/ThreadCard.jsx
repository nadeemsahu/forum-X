import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatTime } from '../utils/formatTime';
import { toggleLike, getUserLikeStatus } from '../utils/localStorageDb';
import { useAuth } from '../context/AuthContext';

const ThreadCard = ({ thread, onAdminAction }) => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [isRead, setIsRead] = useState(thread.isRead);
    const [votes, setVotes] = useState(thread.votes || 0);
    const [voteStatus, setVoteStatus] = useState(false); // true if liked by current user

    useEffect(() => {
        if (user) {
            setVoteStatus(getUserLikeStatus(thread.id, user.id));
        }
    }, [user, thread.id]);

    const handleCardClick = (e) => {
        // Prevent navigation if clicking vote buttons
        if (e.target.closest('.vote-container') || e.target.closest('.author-link')) return;

        setIsRead(true);
        navigate(`/thread/${thread.id}`);
    };

    const handleVote = async () => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Must be logged in to like.', type: 'error' } }));
            return;
        }

        const oldVotes = votes;
        const oldStatus = voteStatus;

        // Optimistic UI
        setVotes(prev => voteStatus ? prev - 1 : prev + 1);
        setVoteStatus(!voteStatus);

        try {
            await toggleLike(thread.id, true, user.id, thread.author);
        } catch (e) {
            setVotes(oldVotes);
            setVoteStatus(oldStatus);
        }
    };

    // Generate color based on author string
    const avatarColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const safeAuthor = thread.author || 'Unknown';
    const charCode = (safeAuthor.charCodeAt(0) || 0) + (safeAuthor.charCodeAt(1) || 0) || 0;
    const color = avatarColors[charCode % avatarColors.length];
    const initials = safeAuthor.slice(0, 2).toUpperCase();

    return (
        <div
            className="thread-card"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleCardClick(e);
            }}
        >
            {/* LIKE COLUMN */}
            <div className="vote-container" style={{ padding: '8px', minWidth: '50px' }}>
                <button
                    className={`vote-btn ${voteStatus ? 'upvoted' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleVote(); }}
                    aria-label="Like"
                    style={{ color: voteStatus ? 'var(--accent)' : 'var(--text-secondary)' }}
                >
                    👍
                </button>
                <span className="vote-count">{votes > 999 ? (votes / 1000).toFixed(1) + 'k' : votes}</span>
            </div>

            <div className="thread-main-content">
                <div className="thread-header">
                    {!isRead && <span className="unread-indicator" aria-label="Unread"></span>}
                    <Link to={`/profile/${safeAuthor}`} className="author-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'inherit' }}>
                        <div className="avatar-circle" style={{ width: '20px', height: '20px', fontSize: '9px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                            {initials}
                        </div>
                        <span style={{ transition: 'color 0.2s', fontWeight: 600, color: 'var(--text-primary)' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>{safeAuthor}</span>
                    </Link>
                    <span style={{ color: 'var(--border-strong)' }}>•</span>
                    <span>{formatTime(thread.timestamp)}</span>
                </div>

                <h3 className="thread-title">{thread.title}</h3>

                <div className="thread-footer">
                    <div className="thread-footer-item">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <span>{thread.replyCount} Comments</span>
                    </div>
                    <div className="thread-footer-item">
                        <span style={{ fontSize: '14px' }}>👁</span>
                        <span>{thread.views || 0} Views</span>
                    </div>
                    <div className="thread-footer-item" onClick={(e) => e.stopPropagation()}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        <span>Share</span>
                    </div>

                    {isAdmin && (
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            {thread.isAnnouncement && <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Announcement</span>}
                            {thread.isPinned && <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Pinned</span>}
                            {thread.isLocked && <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: 'var(--text-secondary)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Locked</span>}

                            <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={(e) => { e.stopPropagation(); onAdminAction && onAdminAction('edit'); }}>
                                Edit
                            </button>
                            <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={(e) => { e.stopPropagation(); onAdminAction && onAdminAction('pin'); }}>
                                {thread.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={(e) => { e.stopPropagation(); onAdminAction && onAdminAction('lock'); }}>
                                {thread.isLocked ? 'Unlock' : 'Lock'}
                            </button>
                            <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: '#ef4444', border: '1px solid #ef444455', borderRadius: 'var(--radius-full)' }} onClick={(e) => { e.stopPropagation(); onAdminAction && onAdminAction('delete'); }}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThreadCard;
