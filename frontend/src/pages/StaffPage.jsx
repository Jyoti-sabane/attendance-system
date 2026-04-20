import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout/Layout';
import Dashboard from '../components/Staff/Dashboard';
import AssignStudents from '../components/Staff/AssignStudents';
import MarkAttendance from '../components/Staff/MarkAttendance';
import ViewAttendance from '../components/Staff/ViewAttendance';

const StaffPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/staff/assign_students', label: 'Assign Students', icon: '👥' },
    { path: '/staff/mark_attendance', label: 'Mark Attendance', icon: '✓' },
    { path: '/staff/view_attendance', label: 'View Attendance', icon: '📈' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout navItems={navItems} user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assign_students" element={<AssignStudents />} />
        <Route path="mark_attendance" element={<MarkAttendance />} />
        <Route path="view_attendance" element={<ViewAttendance />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
};

export default StaffPage;