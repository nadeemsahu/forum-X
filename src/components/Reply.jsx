import React, { useState, useCallback, memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostForm from './PostForm';
import { useAuth } from '../context/AuthContext';
import { toggleLike, getUserLikeStatus } from '../utils/localStorageDb';
import ConfirmationModal from './ConfirmationModal';
import { formatTime } from '../utils/formatTime';

// Extremely simple pseudo-markdown parser simulating a live rich text format
const renderMarkdown = (text) => {
    if (!text) return null;
    // bold text
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    // blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const Reply = memo(({ reply, onReplyAdd, threadId }) => {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [votes, setVotes] = useState(reply.votes || 0);
    const [voteStatus, setVoteStatus] = useState(false);

    useEffect(() => {
        if (user && reply) {
            setVoteStatus(getUserLikeStatus(reply.id, user.id));
        }
    }, [user, reply]);

    const handleReplySubmit = useCallback(async (text) => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Sign in to reply', type: 'error' } }));
            return;
        }
        await onReplyAdd(reply.id, text, reply.author);
        setIsReplying(false);
    }, [reply.id, onReplyAdd, user, reply.author]);

    const handleVote = async () => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Sign in to like', type: 'error' } }));
            return;
        }

        const oldVotes = votes;
        const oldStatus = voteStatus;

        setVotes(prev => voteStatus ? prev - 1 : prev + 1);
        setVoteStatus(!voteStatus);

        try {
            await toggleLike(reply.id, false, user.id, reply.author);
        } catch (e) {
            setVotes(oldVotes);
            setVoteStatus(oldStatus);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteRequest = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        await import('../utils/localStorageDb').then(m => m.deleteReply(threadId, reply.id));
        if (user?.role === 'admin') {
            await import('../utils/localStorageDb').then(m => m.logAdminActivity('Deleted Reply', `By user ${reply.author}`));
        }
        window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Reply deleted', type: 'info' } }));
        window.location.reload();
    };

    const handleEdit = async (newText) => {
        await import('../utils/localStorageDb').then(m => m.editPost(threadId, reply.id, newText));
        if (user?.role === 'admin') {
            await import('../utils/localStorageDb').then(m => m.logAdminActivity('Edited Reply', `By user ${reply.author}`));
        }
        setIsEditing(false);
        reply.text = newText;
        if (user?.role === 'admin') reply.isEditedByAdmin = true;
    };

    if (!reply) return null;

    const avatarColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const safeAuthor = reply.author || 'Unknown';
    const charCode = (safeAuthor.charCodeAt(0) || 0) + (safeAuthor.charCodeAt(1) || 0) || 0;
    const color = avatarColors[charCode % avatarColors.length];
    const initials = safeAuthor.slice(0, 2).toUpperCase();

    return (
        <div className="reply-container" aria-expanded={!isCollapsed}>
            <div className="reply-main">
                <div className="reply-thread-sidebar">
                    <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '12px', backgroundColor: color, zIndex: 2, position: 'relative' }}>
                        {initials}
                    </div>
                    {!isCollapsed && (
                        <div
                            className="reply-thread-line"
                            onClick={() => setIsCollapsed(true)}
                            aria-label="Collapse reply chain"
                            role="button"
                            tabIndex={0}
                        ></div>
                    )}
                </div>

                <div className="reply-content-box" style={{ padding: isCollapsed ? '0' : undefined, backgroundColor: isCollapsed ? 'transparent' : undefined, border: isCollapsed ? 'none' : undefined, boxShadow: isCollapsed ? 'none' : undefined }}>
                    {isCollapsed ? (
                        <div
                            className="collapsed-reply"
                            onClick={() => setIsCollapsed(false)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') setIsCollapsed(false); }}
                        >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            {safeAuthor} • {formatTime(reply.timestamp)} ({(reply.replies ? reply.replies.length : 0)} children)
                        </div>
                    ) : (
                        <>
                            <div className="reply-header">
                                <Link to={`/profile/${safeAuthor}`} className="reply-author-container" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <span style={{ transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = ''}>{safeAuthor}</span>
                                </Link>
                                <span style={{ color: 'var(--border-strong)' }}>•</span>
                                <span>{formatTime(reply.timestamp)}</span>
                                {reply.isEditedByAdmin && <span style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic', marginLeft: '8px' }}>(Edited by Admin)</span>}
                            </div>
                            <div className="reply-text">
                                {renderMarkdown(reply.text)}
                            </div>
                            <div className="reply-actions">
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'transparent', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-soft)' }}>
                                    <button className={`btn-action ${voteStatus ? 'upvoted' : ''}`} onClick={() => handleVote()} style={{ padding: '6px 10px', borderRadius: 'var(--radius-full)', color: voteStatus ? 'var(--accent)' : 'inherit' }}>
                                        👍
                                    </button>
                                    <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '16px', textAlign: 'center', color: 'var(--text-primary)', paddingRight: '12px' }}>{votes}</span>
                                </div>
                                <button
                                    className="btn-action"
                                    onClick={() => setIsReplying(!isReplying)}
                                    aria-expanded={isReplying}
                                    style={{ borderRadius: 'var(--radius-full)', border: '1px solid var(--border-soft)', padding: '6px 12px', backgroundColor: 'transparent' }}
                                >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                    Reply
                                </button>

                                {(user?.role === 'admin' || user?.username === reply.author) && (
                                    <>
                                        <button className="btn-action" style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={() => setIsEditing(true)}>Edit</button>
                                        <button className="btn-action" style={{ padding: '6px 12px', fontSize: '11px', color: '#ef4444', border: '1px solid #ef444455', borderRadius: 'var(--radius-full)' }} onClick={handleDeleteRequest}>Delete</button>
                                    </>
                                )}
                            </div>

                            {isEditing ? (
                                <div style={{ marginTop: 'var(--spacing-md)' }}>
                                    <PostForm initialText={reply.text} onSubmit={handleEdit} onCancel={() => setIsEditing(false)} submitLabel="Save Edit" />
                                </div>
                            ) : isReplying && (
                                <PostForm
                                    onSubmit={handleReplySubmit}
                                    onCancel={() => setIsReplying(false)}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {!isCollapsed && Array.isArray(reply.replies) && reply.replies.length > 0 && (
                <div className="nested-replies">
                    {reply.replies.map(childReply => (
                        <Reply
                            key={childReply?.id || Math.random()}
                            reply={childReply}
                            onReplyAdd={onReplyAdd}
                            threadId={threadId}
                        />
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Secure Delete Reply"
                message={`Are you completely sure you want to permanently delete this reply by ${reply.author}? All nested replies beneath it will also be lost forever.`}
                confirmText="Permanently Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
});

export default Reply;
