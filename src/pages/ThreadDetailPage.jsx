import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getThreadData, addReply, toggleLike, getUserLikeStatus, deleteThread, incrementThreadView } from '../utils/localStorageDb';
import { useAuth } from '../context/AuthContext';
import Reply from '../components/Reply';
import PostForm from '../components/PostForm';
import Skeleton from '../components/Skeleton';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatTime } from '../utils/formatTime';

const renderMarkdown = (text) => {
    if (!text) return null;
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const ThreadDetailPage = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [threadData, setThreadData] = useState(null);
    const [postData, setPostData] = useState(null);
    const [votes, setVotes] = useState(0);
    const [voteStatus, setVoteStatus] = useState(false);
    const [isReplyingToMain, setIsReplyingToMain] = useState(false);
    const [isEditingMain, setIsEditingMain] = useState(false);

    useEffect(() => {
        const fetchThread = async () => {
            try {
                // Increment view purely in background, don't wait for it
                incrementThreadView(threadId);

                const { thread, post } = await getThreadData(threadId);
                setThreadData(thread);
                setPostData(post);
                if (post) setVotes(post.votes || 0);
                if (user && post) setVoteStatus(getUserLikeStatus(post.id, user.id));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchThread();
    }, [threadId, user]);

    const handleReplyAdd = useCallback(async (targetId, text, targetAuthor) => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Must log in to reply.', type: 'error' } }));
            return;
        }
        try {
            const newReply = await addReply(threadId, targetId, user.username, text, targetAuthor);
            const { post } = await getThreadData(threadId);
            setPostData(post);
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Reply posted!', type: 'success' } }));
        } catch (e) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Failed to post reply.', type: 'error' } }));
        }
    }, [threadId, user]);

    const handleMainVote = async () => {
        if (!user) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Sign in to like', type: 'error' } }));
            return;
        }
        const oldVotes = votes;
        const oldStatus = voteStatus;

        // Optimistic toggle
        setVotes(prev => voteStatus ? prev - 1 : prev + 1);
        setVoteStatus(!voteStatus);

        try {
            await toggleLike(postData.id, false, user.id, postData.author); // main post vote
        } catch (e) {
            setVotes(oldVotes);
            setVoteStatus(oldStatus);
        }
    };

    const handleAuthorEdit = async (newText) => {
        await import('../utils/localStorageDb').then(m => m.editPost(threadId, postData.id, newText));
        setIsEditingMain(false);
        setPostData({ ...postData, text: newText, isEditedByAdmin: user?.role === 'admin' ? true : false });
        window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Post updated', type: 'success' } }));
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleAdminDeleteRequest = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        await deleteThread(threadId);
        window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Thread permanently deleted', type: 'info' } }));
        navigate('/');
    };

    if (loading) {
        return (
            <div className="content-area">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <Skeleton width="40px" height="40px" borderRadius="var(--radius-full)" />
                    <Skeleton height="40px" width="120px" />
                </div>
                <Skeleton height="200px" style={{ marginBottom: '32px' }} />
                <div style={{ paddingLeft: '20px' }}>
                    <Skeleton height="80px" style={{ marginBottom: '16px' }} />
                    <Skeleton height="80px" style={{ marginBottom: '16px', marginLeft: '20px' }} />
                </div>
            </div>
        );
    }

    if (!threadData || !postData) {
        return (
            <div className="content-area">
                <h1 className="page-title">Thread not found</h1>
                <Link to="/" className="btn-action" style={{ display: 'inline-block' }}>Go Home</Link>
            </div>
        );
    }

    const avatarColors = ['#ef4444', '#f97316', '#84cc16', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
    const safeAuthor = postData.author || 'Unknown';
    const charCode = (safeAuthor.charCodeAt(0) || 0) + (safeAuthor.charCodeAt(1) || 0) || 0;
    const color = avatarColors[charCode % avatarColors.length];
    const initials = safeAuthor.slice(0, 2).toUpperCase();

    return (
        <div className="content-area">
            <Link to={`/category/${threadData.categoryId}`} className="btn-action" style={{ marginBottom: 'var(--spacing-xl)', display: 'inline-flex' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Threads
            </Link>

            <div className="post-main" style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                <div className="vote-container" style={{ paddingTop: '8px' }}>
                    <button className={`vote-btn ${voteStatus ? 'upvoted' : ''}`} onClick={() => handleMainVote()} style={{ transform: 'scale(1.2)', color: voteStatus ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        👍
                    </button>
                    <span className="vote-count" style={{ fontSize: 'var(--font-size-xl)' }}>{votes > 999 ? (votes / 1000).toFixed(1) + 'k' : votes}</span>
                </div>

                <div style={{ flex: 1 }}>
                    <div className="thread-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <Link to={`/profile/${safeAuthor}`} className="thread-author-container" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="avatar-circle" style={{ width: '24px', height: '24px', fontSize: '12px', backgroundColor: color }}>
                                {initials}
                            </div>
                            <span style={{ fontSize: 'var(--font-size-md)', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = ''}>{safeAuthor}</span>
                        </Link>
                        <span>•</span>
                        <span style={{ fontSize: 'var(--font-size-md)' }}>{formatTime(postData.timestamp)}</span>
                        {(postData.isEditedByAdmin || postData.text !== postData.originalText) && <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginLeft: '6px' }}>(Edited)</span>}
                    </div>
                    <h1 className="post-title" style={{ fontSize: '36px' }}>{threadData.title}</h1>

                    {isEditingMain ? (
                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <PostForm initialText={postData.text} onSubmit={handleAuthorEdit} onCancel={() => setIsEditingMain(false)} submitLabel="Save Edit" />
                        </div>
                    ) : (
                        <div className="post-content markdown-preview" style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 'var(--font-size-lg)' }}>
                            {renderMarkdown(postData.text)}
                        </div>
                    )}

                    <div className="thread-footer">
                        <div className="thread-footer-item" onClick={() => { if (!threadData.isLocked) setIsReplyingToMain(!isReplyingToMain); }} style={{ cursor: threadData.isLocked ? 'not-allowed' : 'pointer', opacity: threadData.isLocked ? 0.5 : 1 }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            <span>{threadData.isLocked ? 'Thread Locked' : 'Add a Comment'}</span>
                        </div>
                        <div className="thread-footer-item" style={{ cursor: 'pointer' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            <span>Share Route</span>
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            {/* Author or Admin Controls */}
                            {(user?.role === 'admin' || user?.username === threadData.author) && (
                                <>
                                    <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={() => setIsEditingMain(true)}>
                                        Edit
                                    </button>
                                    <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: '#ef4444', border: '1px solid #ef444455', borderRadius: 'var(--radius-full)' }} onClick={() => setIsDeleteModalOpen(true)}>
                                        Delete
                                    </button>
                                </>
                            )}
                            {/* Admin ONLY Controls */}
                            {user?.role === 'admin' && (
                                <>
                                    <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={async () => { await import('../utils/localStorageDb').then(m => m.pinThread(threadId, !threadData.isPinned)); setThreadData({ ...threadData, isPinned: !threadData.isPinned }); }}>
                                        {threadData.isPinned ? 'Unpin' : 'Pin'}
                                    </button>
                                    <button className="btn-action" style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-full)' }} onClick={async () => { await import('../utils/localStorageDb').then(m => m.lockThread(threadId, !threadData.isLocked)); setThreadData({ ...threadData, isLocked: !threadData.isLocked }); }}>
                                        {threadData.isLocked ? 'Unlock' : 'Lock'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {isReplyingToMain && (
                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <PostForm
                                onSubmit={(text) => {
                                    handleReplyAdd(postData.id, text, postData.author);
                                    setIsReplyingToMain(false);
                                }}
                                onCancel={() => setIsReplyingToMain(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="replies-section">
                {postData.replies && postData.replies.map(reply => (
                    <Reply key={reply.id} reply={reply} onReplyAdd={handleReplyAdd} threadId={threadId} />
                ))}
                {(!postData.replies || postData.replies.length === 0) && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xxxl)', color: 'var(--text-secondary)' }}>
                        <svg style={{ margin: '0 auto var(--spacing-md)' }} width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: '500' }}>No comments yet.</p>
                        <p>Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Secure Delete Thread"
                message="Are you sure you want to permanently delete this thread? All replies will be lost forever."
                confirmText="Permanently Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default ThreadDetailPage;
