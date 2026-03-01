import React, { useState, useEffect } from 'react';

const EditThreadModal = ({ isOpen, onClose, thread, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isAnnouncement, setIsAnnouncement] = useState(false);

    useEffect(() => {
        if (thread && isOpen) {
            setTitle(thread.title);
            setBody(thread.body);
            setIsAnnouncement(thread.isAnnouncement || false);
        }
    }, [thread, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(title, body, isAnnouncement);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Edit Thread (Admin)</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div>
                        <label className="form-label">Thread Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">Thread Body (Markdown Supported)</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '150px', resize: 'vertical' }}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIsAnnouncement(!isAnnouncement)}>
                        <input
                            type="checkbox"
                            checked={isAnnouncement}
                            onChange={(e) => setIsAnnouncement(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: isAnnouncement ? 'var(--accent)' : 'var(--text-primary)' }}>Mark as Platform Announcement</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <button type="button" className="btn-action" onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
                        <button type="submit" className="btn-submit" style={{ padding: '8px 24px' }}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditThreadModal;
