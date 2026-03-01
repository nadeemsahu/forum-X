import React, { useState, useEffect } from 'react';
import { getAnnouncement } from '../utils/localStorageDb';

const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            const data = await getAnnouncement();
            setAnnouncement(data);
        };
        fetchAnnouncement();

        // Optional: Let's poll or listen to a custom event so it updates without refresh when Admin changes it
        const handleUpdate = () => fetchAnnouncement();
        window.addEventListener('announcement-updated', handleUpdate);
        return () => window.removeEventListener('announcement-updated', handleUpdate);
    }, []);

    if (!announcement) return null;

    return (
        <div style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--glass-white)',
            textAlign: 'center',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1000,
            position: 'relative'
        }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
            <span style={{ letterSpacing: '0.2px' }}>{announcement}</span>
        </div>
    );
};

export default AnnouncementBanner;
