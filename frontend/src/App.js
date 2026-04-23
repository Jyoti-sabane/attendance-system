import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import StaffPage from './pages/StaffPage';
import PrivateRoute from './components/Common/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/register" element={<AuthPage type="register" />} />
          
          <Route path="/admin/*" element={
            <PrivateRoute role="admin">
              <AdminPage />
            </PrivateRoute>
          } />
          
          <Route path="/staff/*" element={
            <PrivateRoute role="staff">
              <StaffPage />
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
