import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getThreads, getCategories, deleteThread, pinThread, lockThread, logAdminActivity, editThread } from '../utils/localStorageDb';
import { useAuth } from '../context/AuthContext';
import ThreadCard from '../components/ThreadCard';
import Skeleton from '../components/Skeleton';
import EditThreadModal from '../components/EditThreadModal';
import ConfirmationModal from '../components/ConfirmationModal';

const ThreadsPage = () => {
    const { categoryId } = useParams();
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [categoryThreads, setCategoryThreads] = useState([]);
    const [category, setCategory] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const cats = await getCategories();
            const cat = cats.find(c => c.id === categoryId);
            const data = await getThreads(categoryId);
            setCategory(cat);
            setCategoryThreads(data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, [categoryId]);

    const sortedThreads = useMemo(() => {
        return [...categoryThreads].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            if (sortOrder === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
            if (sortOrder === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
            if (sortOrder === 'most_liked') return (b.votes || 0) - (a.votes || 0);
            if (sortOrder === 'most_replies') return (b.replyCount || 0) - (a.replyCount || 0);

            return 0;
        });
    }, [categoryThreads, sortOrder]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingThread, setEditingThread] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState(null);

    const handleAdminAction = async (action, threadId, threadTitle, currentState) => {
        if (!isAdmin) return;

        if (action === 'delete') {
            const t = categoryThreads.find(x => x.id === threadId);
            setThreadToDelete(t);
            setIsDeleteModalOpen(true);
        }
        if (action === 'pin') {
            await pinThread(threadId, !currentState);
            logAdminActivity(currentState ? 'Unpinned Thread' : 'Pinned Thread', threadTitle);
            fetchThreads();
        }
        if (action === 'lock') {
            await lockThread(threadId, !currentState);
            logAdminActivity(currentState ? 'Unlocked Thread' : 'Locked Thread', threadTitle);
            fetchThreads();
        }
        if (action === 'edit') {
            const t = categoryThreads.find(x => x.id === threadId);
            if (t) {
                setEditingThread(t);
                setIsEditModalOpen(true);
            }
        }
    };

    const handleEditSubmit = async (newTitle, newBody, isAnnouncement) => {
        if (editingThread) {
            await editThread(editingThread.id, newTitle, newBody, isAnnouncement);
            logAdminActivity('Edited Thread', newTitle);
            setIsEditModalOpen(false);
            setEditingThread(null);
            fetchThreads();
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: `Thread updated via Admin`, type: 'success' } }));
        }
    };

    const confirmThreadDelete = async () => {
        if (!threadToDelete) return;

        await deleteThread(threadToDelete.id);
        logAdminActivity('Deleted Thread', threadToDelete.title);
        fetchThreads();
        window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: `Thread permanently deleted`, type: 'info' } }));
        setThreadToDelete(null);
    };

    if (loading) {
        return (
            <div className="content-area">
                <Skeleton height="40px" width="300px" style={{ marginBottom: '24px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Skeleton height="36px" width="150px" />
                    <Skeleton height="36px" width="100px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height="150px" borderRadius="var(--radius-lg)" />)}
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="content-area">
                <h1 className="page-title">Category not found</h1>
                <Link to="/" className="btn-action" style={{ display: 'inline-block' }}>Back to Categories</Link>
            </div>
        );
    }

    return (
        <div className="content-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                <span style={{ fontSize: '32px', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '16px' }}>{category.icon}</span>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>{category.name}</h1>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{category.description}</div>
                </div>
            </div>

            <div className="thread-list-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Sort by:</span>
                    <select
                        className="post-textarea"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{ padding: '8px 16px', minHeight: 'auto', width: 'auto', appearance: 'auto' }}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="most_liked">Most Liked</option>
                        <option value="most_replies">Most Replies</option>
                    </select>
                </div>
            </div>

            {sortedThreads.length === 0 ? (
                <div className="post-main" style={{ textAlign: 'center', padding: '64px', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-soft)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: '8px' }}>It's quiet here</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Be the first to start a discussion in this space!</p>
                </div>
            ) : (
                <div className="thread-list">
                    {sortedThreads.map(thread => (
                        <ThreadCard
                            key={thread.id}
                            thread={thread}
                            onAdminAction={(action) => handleAdminAction(action, thread.id, thread.title, action === 'pin' ? thread.isPinned : thread.isLocked)}
                        />
                    ))}
                </div>
            )}

            <EditThreadModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                thread={editingThread}
                onSubmit={handleEditSubmit}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmThreadDelete}
                title="Secure Delete Thread"
                message={`Are you completely sure you want to permanently delete "${threadToDelete?.title}"? All replies and content within will be lost forever.`}
                confirmText="Permanently Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default ThreadsPage;
