import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as dbLogin, signup as dbSignup, logout as dbLogout, getSession, validateAndCleanDatabase } from '../utils/localStorageDb';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Run corruption guard self-heal on load
        validateAndCleanDatabase();

        // Check initial session
        const sessionUser = getSession();
        if (sessionUser) {
            setUser(sessionUser);
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const sessionUser = await dbLogin(username, password);
            setUser(sessionUser);
        } catch (error) {
            console.error("AuthContext Login Error:", error.message);
            throw error;
        }
    };

    const signup = async (username, password) => {
        try {
            const sessionUser = await dbSignup(username, password);
            setUser(sessionUser);
        } catch (error) {
            console.error("AuthContext Signup Error:", error.message);
            throw error;
        }
    };

    const logout = async () => {
        await dbLogout();
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
