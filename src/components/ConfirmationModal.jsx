import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '400px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--spacing-xl)', lineHeight: 1.5 }}>
                    {message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                    <button
                        className="btn-action"
                        onClick={onClose}
                        style={{ padding: '8px 16px' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn-submit"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isDestructive ? '#ef4444' : 'var(--text-primary)',
                            color: isDestructive ? 'white' : 'var(--bg-primary)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
