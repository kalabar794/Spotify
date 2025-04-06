import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const defaultValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.getItem('token')) {
        try {
          const res = await axios.get(`${API_URL}/api/auth/user`, {
            headers: {
              'x-auth-token': localStorage.getItem('token')
            }
          });
          
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [API_URL]);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  // Register user
  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null);
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 