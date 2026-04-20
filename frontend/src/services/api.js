import axios from 'axios';

const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const adminAPI = {
  // Dashboard & Stats
  getStats: () => api.get('/api/admin/stats'),
  
  // Student Management
  getStudents: () => api.get('/api/admin/students'),
  addStudent: (data) => api.post('/api/admin/students', data),
  updateStudent: (id, data) => api.put(`/api/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/api/admin/students/${id}`),
  getStudent: (id) => api.get(`/api/admin/students/${id}`),
  
  // Attendance
  getAttendance: (params) => api.get('/api/admin/attendance', { params }),
  
  // Staff Management
  getStaff: () => {
    console.log('Fetching staff...');
    return api.get('/api/admin/staff');
  },
  
  // Subject Management
  getSubjects: () => {
    console.log('Fetching subjects...');
    return api.get('/api/admin/subjects');
  },
  getAllSubjects: () => {
    console.log('Fetching all subjects...');
    return api.get('/api/admin/subjects');
  },
  addSubject: (data) => api.post('/api/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/api/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/api/admin/subjects/${id}`),
  getSubjectById: (id) => api.get(`/api/admin/subjects/${id}`),
  
  // Staff-Subject Assignment
  assignStaff: (data) => api.post('/api/admin/assign-staff', data),
  getAssignments: () => api.get('/api/admin/assignments'),
  removeAssignment: (id) => api.delete(`/api/admin/assignments/${id}`)
};

export const staffAPI = {
  getSubjects: () => api.get('/api/staff/subjects'),
  getAllStudents: () => api.get('/api/staff/students/all'),
  assignStudents: (data) => api.post('/api/staff/assign-students', data),
  getAssignedStudents: () => api.get('/api/staff/assigned-students'),
  getSubjectStudents: (subjectId) => api.get(`/api/staff/subjects/${subjectId}/students`),
  saveAttendance: (data) => api.post('/api/staff/attendance', data),
  getAttendanceReport: (params) => api.get('/api/staff/attendance-report', { params })
};

export default api;