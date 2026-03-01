import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../utils/localStorageDb';
import Skeleton from '../components/Skeleton';

const CategoriesPage = () => {
    const [loading, setLoading] = useState(true);
    const [cats, setCats] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getCategories();
            setCats(data);
            setLoading(false);
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="content-area">
                <Skeleton height="48px" width="300px" style={{ marginBottom: '32px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" borderRadius="var(--radius-lg)" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="content-area">
            <h1 className="page-title">Explore Spaces</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {cats.map(cat => (
                    <Link key={cat.id} to={`/category/${cat.id}`} className="thread-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-xs)' }}>{cat.icon}</div>
                        <h2 className="thread-title" style={{ fontSize: 'var(--font-size-xl)' }}>{cat.name}</h2>
                        <div className="thread-header">{cat.description}</div>
                        <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--accent)', fontWeight: '600' }}>
                            View Space →
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoriesPage;
