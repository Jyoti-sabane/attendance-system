const express = require('express');
const router = express.Router();
const { validateSession, isStaff } = require('../middleware/auth');
const staffController = require('../controllers/staffController');

// Apply authentication to ALL staff routes
router.use(validateSession);
router.use(isStaff);

// Staff routes
router.get('/subjects', staffController.getAssignedSubjects);
router.get('/students/all', staffController.getAllStudents);
router.post('/assign-students', staffController.assignStudentsToSubject);
router.get('/assigned-students', staffController.getAssignedStudents);
router.get('/subjects/:subject_id/students', staffController.getSubjectStudents);
router.post('/attendance', staffController.saveAttendance);
router.get('/attendance-report', staffController.getAttendanceReport);

module.exports = router;
