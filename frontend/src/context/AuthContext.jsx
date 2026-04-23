import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token on app load
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('https://attendance-system-hlpr.onrender.com/api/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Save token and user to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      const errorMsg = error.response?.data?.error || 'Registration failed';
      toast.error(errorMsg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
