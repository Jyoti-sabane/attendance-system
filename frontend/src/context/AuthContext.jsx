import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get('https://attendance-system-hlpr.onrender.com/api/auth/check-session', {
        withCredentials: true
      });
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('https://attendance-system-hlpr.onrender.com/api/auth/login', credentials, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Login API response:', response.data);
      
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Login successful!');
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('https://attendance-system-hlpr.onrender.com/api/auth/register', {
        username: userData.username,
        password: userData.password,
        confirm_password: userData.confirm_password,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      }, {
        withCredentials: true
      });
      
      console.log('Register API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('https://attendance-system-hlpr.onrender.com/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
