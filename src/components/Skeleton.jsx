import React from 'react';

const Skeleton = ({ width, height, borderRadius, style, className = '' }) => {
    return (
        <div
            className={`skeleton-box ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: borderRadius || 'var(--radius-sm)',
                ...style
            }}
            aria-hidden="true"
        ></div>
    );
};

export default Skeleton;
