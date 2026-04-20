import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthPage = ({ type }) => {
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    full_name: '',
    role: 'staff'
  });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const response = await login({
          username: formData.username,
          password: formData.password
        });
        if (response.success) {
          navigate(response.redirect);
        }
      } else {
        // Check if passwords match
        if (formData.password !== formData.confirm_password) {
          toast.error('Passwords do not match!');
          setLoading(false);
          return;
        }
        
        // Send ALL data including confirm_password
        await register({
          username: formData.username,
          password: formData.password,
          confirm_password: formData.confirm_password,  // ADD THIS LINE
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role
        });
        
        // Clear form and switch to login
        setIsLogin(true);
        setFormData({ 
          username: '', 
          password: '', 
          confirm_password: '', 
          email: '', 
          full_name: '', 
          role: 'staff' 
        });
        toast.success('Registration successful! Please login.');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <button type="submit" className="btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="auth-link">
          {isLogin ? (
            <p>Don't have an account? <a onClick={() => setIsLogin(false)}>Register</a></p>
          ) : (
            <p>Already have an account? <a onClick={() => setIsLogin(true)}>Login</a></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;