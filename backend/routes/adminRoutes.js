const express = require('express');
const router = express.Router();
const { validateSession, isAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply authentication middleware to all routes
router.use(validateSession);
router.use(isAdmin);

// ========== DASHBOARD ROUTES ==========
router.get('/stats', adminController.getDashboardStats);

// ========== STUDENT ROUTES ==========
router.get('/students', adminController.getStudents);
router.post('/students', adminController.addStudent);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// ========== ATTENDANCE ROUTES ==========
router.get('/attendance', adminController.getAttendanceRecords);

// ========== STAFF ROUTES ==========
router.get('/staff', adminController.getStaffMembers);

// ========== SUBJECT ROUTES ==========
router.get('/subjects', adminController.getAllSubjects);
router.post('/subjects', adminController.addSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);
router.get('/subjects/:id', adminController.getSubjectById);

// ========== STAFF-SUBJECT ASSIGNMENT ROUTES ==========
router.post('/assign-staff', adminController.assignStaffToSubject);
router.get('/assignments', adminController.getAssignments);
router.delete('/assignments/:id', adminController.removeAssignment);

module.exports = router;