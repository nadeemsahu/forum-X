import React, { useState, useEffect } from 'react';
import { getCategories, createThread } from '../utils/localStorageDb';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateThreadModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && categories.length === 0) {
            getCategories().then(cats => {
                setCategories(cats);
                if (cats.length > 0) setCategoryId(cats[0].id);
            });
        }
    }, [isOpen, categories.length]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !text.trim() || !categoryId) return;

        if (!user) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Must be logged in to create a thread.', type: 'error' } }));
            return;
        }

        setLoading(true);
        try {
            const threadId = await createThread(user.id, user.username, categoryId, title, text);
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Thread created successfully!', type: 'success' } }));
            onClose();
            // Reset form
            setTitle(''); setText('');
            navigate(`/thread/${threadId}`);
        } catch (err) {
            window.dispatchEvent(new CustomEvent('add-toast', { detail: { message: 'Failed to create thread.', type: 'error' } }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeUp 0.3s ease-out' }}>
            <div className="post-main" style={{ width: '100%', maxWidth: '640px', padding: '48px', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease-out', boxShadow: '0 24px 64px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 300, letterSpacing: '-1px' }}>Create New Post</h2>
                    <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-soft)', borderRadius: '50%', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Community / Space</label>
                        <select
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className="post-textarea"
                            style={{ minHeight: '44px', padding: '10px 16px', backgroundColor: 'var(--bg-primary)' }}
                            required
                        >
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="post-textarea"
                            style={{ minHeight: '44px', padding: '10px 16px', fontSize: '18px', fontWeight: 600 }}
                            placeholder="An interesting title"
                            maxLength={300}
                            required
                        />
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'right' }}>{title.length}/300</div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Body</label>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            className="post-textarea"
                            style={{ minHeight: '200px' }}
                            placeholder="What are your thoughts? You can use **markdown** here."
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Posting...' : 'Post Thread'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThreadModal;
