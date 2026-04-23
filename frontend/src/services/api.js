import axios from 'axios';

const API_URL = 'https://attendance-system-hlpr.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // THIS IS CRITICAL - sends cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  addStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  getAttendance: (params) => api.get('/admin/attendance', { params }),
  getStaff: () => api.get('/admin/staff'),
  getSubjects: () => api.get('/admin/subjects'),
  getAllSubjects: () => api.get('/admin/subjects'),
  addSubject: (data) => api.post('/admin/subjects', data),
  updateSubject: (id, data) => api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  assignStaff: (data) => api.post('/admin/assign-staff', data),
  getAssignments: () => api.get('/admin/assignments'),
  removeAssignment: (id) => api.delete(`/admin/assignments/${id}`)
};

export const staffAPI = {
  getSubjects: () => api.get('/staff/subjects'),
  getAllStudents: () => api.get('/staff/students/all'),
  assignStudents: (data) => api.post('/staff/assign-students', data),
  getAssignedStudents: () => api.get('/staff/assigned-students'),
  getSubjectStudents: (subjectId) => api.get(`/staff/subjects/${subjectId}/students`),
  saveAttendance: (data) => api.post('/staff/attendance', data),
  getAttendanceReport: (params) => api.get('/staff/attendance-report', { params })
};

export default api;
