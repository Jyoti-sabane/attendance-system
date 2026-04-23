const express = require('express');
const router = express.Router();
const { verifyToken, isStaff } = require('../middleware/authJWT');
const staffController = require('../controllers/staffController');

// Apply JWT verification to ALL staff routes
router.use(verifyToken);
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
