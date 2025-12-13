import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import api from '../lib/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for stored user/token on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            // Set default auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (firstName: string, lastName: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/signup', { firstName, lastName, email, password });
            const { user, token } = response.data;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const googleLogin = async (token: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/google', { token });
            const { user, token: jwtToken } = response.data;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', jwtToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;

            setUser(user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, googleLogin, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

