import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout/Layout';
import Dashboard from '../components/Admin/Dashboard';
import ManageStudents from '../components/Admin/ManageStudents';
import AddStudent from '../components/Admin/AddStudent';
import EditStudent from '../components/Admin/EditStudent';
import ViewAttendance from '../components/Admin/ViewAttendance';
import AssignStaffSubjects from '../components/Admin/AssignStaffSubjects';
import ManageSubjects from '../components/Admin/ManageSubjects'; // ADD THIS

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/manage_students', label: 'Manage Students', icon: '👨‍🎓' },
    { path: '/admin/manage_subjects', label: 'Manage Subjects', icon: '📚' }, // ADD THIS
    { path: '/admin/view_attendance', label: 'View Attendance', icon: '📅' },
    { path: '/admin/assign_staff_subjects', label: 'Assign Staff Subjects', icon: '👨‍🏫' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout navItems={navItems} user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage_students" element={<ManageStudents />} />
        <Route path="add_student" element={<AddStudent />} />
        <Route path="edit_student" element={<EditStudent />} />
        <Route path="manage_subjects" element={<ManageSubjects />} /> {/* ADD THIS */}
        <Route path="view_attendance" element={<ViewAttendance />} />
        <Route path="assign_staff_subjects" element={<AssignStaffSubjects />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
};

export default AdminPage;