import React, { useState } from 'react';

// Extremely simple pseudo-markdown parser exactly like in Reply.jsx
const renderMarkdown = (text) => {
    if (!text) return null;
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const PostForm = ({ onSubmit, onCancel, placeholder = "What are your thoughts? Use **bold**, `code`, or > quotes." }) => {
    const [text, setText] = useState('');
    const MAX_CHARS = 300;

    const handleChange = (e) => {
        setText(e.target.value);
    };

    const handleSubmit = () => {
        if (text.trim().length > 0 && text.trim().length <= MAX_CHARS) {
            onSubmit(text.trim());
            setText('');
        }
    };

    const isLimitReached = text.length > MAX_CHARS;
    const isButtonDisabled = text.trim().length === 0 || isLimitReached;

    return (
        <div className="post-form-container">
            <textarea
                className="post-textarea"
                placeholder={placeholder}
                value={text}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!isButtonDisabled) handleSubmit();
                    }
                    if (e.key === 'Escape' && onCancel) {
                        onCancel();
                    }
                }}
                aria-label="Post text"
            />

            {text.trim() && (
                <div className="markdown-preview">
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</div>
                    {renderMarkdown(text)}
                </div>
            )}

            <div className="post-form-footer">
                <div className={`char-counter ${isLimitReached ? 'limit-reached' : ''}`} aria-live="polite">
                    {text.length} / {MAX_CHARS}
                </div>
                <div className="form-actions">
                    {onCancel && (
                        <button
                            className="btn-cancel"
                            onClick={onCancel}
                            aria-label="Cancel post"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        className="btn-submit"
                        onClick={handleSubmit}
                        disabled={isButtonDisabled}
                        aria-label="Submit post"
                    >
                        Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostForm;
