import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get allowed emails from environment variable
    const allowedEmails = import.meta.env.VITE_ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [];

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);

            // Check if user email is in the allowed list
            if (allowedEmails.length > 0 && !allowedEmails.includes(decoded.email)) {
                throw new Error('Access denied. Your email is not authorized to access this application.');
            }

            const userData = {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                sub: decoded.sub,
            };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isAuthorized = (email) => {
        if (allowedEmails.length === 0) return true; // If no whitelist, allow all
        return allowedEmails.includes(email);
    };

    const value = {
        user,
        login,
        logout,
        isAuthorized,
        loading,
        allowedEmails,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
