import React from 'react';

// Renders a simple slide up glassmorphism toast.
// The toast-container class handles the stacking and positioning via layout.css
const Toast = ({ message, type = 'info', onClose }) => {
    // We can add simple logic here to render success / error icons
    const icon = type === 'success'
        ? <svg width="24" height="24" fill="none" stroke="#22c55e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        : <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

    return (
        <div className="toast">
            {icon}
            <span>{message}</span>
        </div>
    );
};

export default Toast;
