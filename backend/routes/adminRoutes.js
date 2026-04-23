const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authJWT');
const adminController = require('../controllers/adminController');

// Apply JWT verification to ALL admin routes
router.use(verifyToken);
router.use(isAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/students', adminController.getStudents);
router.post('/students', adminController.addStudent);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.get('/attendance', adminController.getAttendanceRecords);
router.get('/staff', adminController.getStaffMembers);
router.get('/subjects', adminController.getAllSubjects);
router.post('/subjects', adminController.addSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);
router.post('/assign-staff', adminController.assignStaffToSubject);
router.get('/assignments', adminController.getAssignments);
router.delete('/assignments/:id', adminController.removeAssignment);

module.exports = router;
