import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ categories }) => {
    return (
        <aside className="sidebar">
            <h3>Spaces</h3>
            <ul className="category-list">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `category-item ${isActive ? 'active' : ''}`}
                        end
                    >
                        {({ isActive }) => (
                            <>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                <span>Overview</span>
                            </>
                        )}
                    </NavLink>
                </li>
                {categories.map(cat => (
                    <li key={cat.id}>
                        <NavLink
                            to={`/category/${cat.id}`}
                            className={({ isActive }) => `category-item ${isActive ? 'active' : ''}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <span style={{ fontSize: '16px', marginRight: '4px' }}>{cat.icon}</span>
                                    <span>{cat.name}</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <h3 style={{ marginTop: '32px' }}>Trending</h3>
            <ul className="category-list">
                <li>
                    <div className="category-item" style={{ cursor: 'pointer' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: '4px' }}>#</span>
                        <span>React 19 Release</span>
                    </div>
                </li>
                <li>
                    <div className="category-item" style={{ cursor: 'pointer' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: '4px' }}>#</span>
                        <span>Tailwind vs Vanilla CSS</span>
                    </div>
                </li>
                <li>
                    <div className="category-item" style={{ cursor: 'pointer' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: '4px' }}>#</span>
                        <span>Frontend Interviews</span>
                    </div>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
