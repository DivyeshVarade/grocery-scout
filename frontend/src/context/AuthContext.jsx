import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/auth/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' } // axios handles boundary
        });

        // Fetch user details after successful login
        const res = await api.get('/auth/me');
        setUser(res.data);
        return res.data;
    };

    const register = async (email, password, profileData) => {
        await api.post('/auth/register', { email, password, profileData });
        // Auto-login after successful registration
        await login(email, password);
        // User set inside login()
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

