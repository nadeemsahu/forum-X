import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="content-area" style={{ textAlign: 'center', paddingTop: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '100px', fontWeight: '900', color: 'var(--border-soft)', lineHeight: 1, marginBottom: 'var(--spacing-lg)' }}>404</div>
            <h1 className="page-title" style={{ marginBottom: 'var(--spacing-md)' }}>Space Not Found</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xxl)', fontSize: 'var(--font-size-lg)', maxWidth: '400px' }}>
                The discussion you are looking for has been archived, moved, or never existed.
            </p>
            <Link to="/" className="btn-submit" style={{ display: 'inline-flex', padding: '12px 32px', fontSize: 'var(--font-size-md)' }}>
                ← Return Home
            </Link>
        </div>
    );
};

export default NotFound;
