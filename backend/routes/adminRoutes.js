const express = require('express');
const router = express.Router();
const { validateSession, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply authentication to ALL admin routes
router.use(validateSession);
router.use(isAdmin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Student Management
router.get('/students', adminController.getStudents);
router.post('/students', adminController.addStudent);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Attendance
router.get('/attendance', adminController.getAttendanceRecords);

// Staff Management
router.get('/staff', adminController.getStaffMembers);

// Subject Management
router.get('/subjects', adminController.getAllSubjects);
router.post('/subjects', adminController.addSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);
router.get('/subjects/:id', adminController.getSubjectById);

// Staff-Subject Assignment
router.post('/assign-staff', adminController.assignStaffToSubject);
router.get('/assignments', adminController.getAssignments);
router.delete('/assignments/:id', adminController.removeAssignment);

// Export routes
router.get('/export-excel', adminController.generateExcelReport);
router.get('/export-csv', adminController.generateCSVReport);

module.exports = router;
