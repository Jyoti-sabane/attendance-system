const Student = require('../models/Student');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const StaffSubject = require('../models/StaffSubject');
const StudentSubject = require('../models/StudentSubject');

// ========== DASHBOARD STATS ==========
const getDashboardStats = async (req, res) => {
    try {
        const student_count = await Student.countDocuments();
        const staff_count = await User.countDocuments({ role: 'staff' });
        const subject_count = await Subject.countDocuments();
        const attendance_count = await Attendance.countDocuments();
        
        res.json({ student_count, staff_count, subject_count, attendance_count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== STUDENT MANAGEMENT ==========
const getStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ roll_number: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addStudent = async (req, res) => {
    try {
        const { roll_number, student_name, email, branch, year } = req.body;
        
        const existing = await Student.findOne({ roll_number });
        if (existing) {
            return res.status(400).json({ error: 'Roll number already exists!' });
        }
        
        const student = new Student({ roll_number, student_name, email, branch, year });
        await student.save();
        
        res.json({ success: true, message: 'Student added successfully!', student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { roll_number, student_name, email, branch, year } = req.body;
        
        await Student.findByIdAndUpdate(req.params.id, {
            roll_number, student_name, email, branch, year
        });
        
        res.json({ success: true, message: 'Student updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        await StudentSubject.deleteMany({ student_id: req.params.id });
        await Attendance.deleteMany({ student_id: req.params.id });
        
        res.json({ success: true, message: 'Student deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== ATTENDANCE RECORDS ==========
const getAttendanceRecords = async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const students = await Student.find().sort({ roll_number: 1 });
        
        const records = [];
        for (const student of students) {
            const attendance = await Attendance.find({
                student_id: student._id,
                attendance_date: { $gte: startDate, $lte: endDate }
            });
            
            const total_attendance = attendance.filter(a => a.status === 'present').length;
            const total_days = attendance.length;
            let percentage = total_days > 0 ? (total_attendance / total_days) * 100 : 0;
            
            records.push({
                id: student._id,
                roll_number: student.roll_number,
                student_name: student.student_name,
                branch: student.branch,
                year: student.year,
                total_attendance,
                total_days,
                percentage: percentage.toFixed(2)
            });
        }
        
        res.json({ students: records, month, year });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== STAFF MANAGEMENT ==========
const getStaffMembers = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).select('-password');
        console.log('Staff found:', staff.length);
        res.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({ error: error.message });
    }
};

// ========== SUBJECT MANAGEMENT ==========
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ subject_code: 1 });
        console.log('Subjects found:', subjects.length);
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: error.message });
    }
};

const addSubject = async (req, res) => {
    try {
        const { subject_code, subject_name } = req.body;
        
        const existing = await Subject.findOne({ subject_code: subject_code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ error: 'Subject code already exists!' });
        }
        
        const subject = new Subject({ 
            subject_code: subject_code.toUpperCase(), 
            subject_name 
        });
        await subject.save();
        
        console.log('Subject added:', subject_code);
        res.json({ success: true, message: 'Subject added successfully!', subject });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateSubject = async (req, res) => {
    try {
        const { subject_code, subject_name } = req.body;
        const subjectId = req.params.id;
        
        const existing = await Subject.findOne({ 
            subject_code: subject_code.toUpperCase(),
            _id: { $ne: subjectId }
        });
        
        if (existing) {
            return res.status(400).json({ error: 'Subject code already exists!' });
        }
        
        const subject = await Subject.findByIdAndUpdate(
            subjectId,
            { subject_code: subject_code.toUpperCase(), subject_name },
            { new: true }
        );
        
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        console.log('Subject updated:', subject_code);
        res.json({ success: true, message: 'Subject updated successfully!', subject });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const subjectId = req.params.id;
        
        const subject = await Subject.findByIdAndDelete(subjectId);
        
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        
        await StaffSubject.deleteMany({ subject_id: subjectId });
        await StudentSubject.deleteMany({ subject_id: subjectId });
        
        console.log('Subject deleted:', subject.subject_code);
        res.json({ success: true, message: 'Subject deleted successfully!' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: error.message });
    }
};

const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: error.message });
    }
};

// ========== STAFF-SUBJECT ASSIGNMENT ==========
const assignStaffToSubject = async (req, res) => {
    try {
        const { staff_id, subject_id } = req.body;
        
        const existing = await StaffSubject.findOne({ staff_id, subject_id });
        if (existing) {
            return res.status(400).json({ error: 'Staff already assigned to this subject!' });
        }
        
        const assignment = new StaffSubject({ staff_id, subject_id });
        await assignment.save();
        
        console.log('Staff assigned to subject');
        res.json({ success: true, message: 'Staff assigned successfully!' });
    } catch (error) {
        console.error('Error assigning staff:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAssignments = async (req, res) => {
    try {
        const assignments = await StaffSubject.find()
            .populate('staff_id', 'full_name username')
            .populate('subject_id', 'subject_code subject_name');
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: error.message });
    }
};

const removeAssignment = async (req, res) => {
    try {
        await StaffSubject.findByIdAndDelete(req.params.id);
        console.log('Assignment removed');
        res.json({ success: true, message: 'Assignment removed successfully!' });
    } catch (error) {
        console.error('Error removing assignment:', error);
        res.status(500).json({ error: error.message });
    }
};

// ========== EXPORT FUNCTIONS (FIX FOR THE RENDER ERROR) ==========
/**
 * Generates an Excel report for attendance.
 * This function is required by adminRoutes.js
 */
const generateExcelReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        console.log(`Excel report requested for ${month}/${year}`);
        
        // TODO: Implement full Excel generation logic here
        // For now, return a success message to prevent the route from crashing
        res.status(200).json({ 
            success: true, 
            message: `Excel report for ${month}/${year} - Feature coming soon!` 
        });
    } catch (error) {
        console.error('Error generating Excel report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

/**
 * Generates a CSV report for attendance.
 * This function is required by adminRoutes.js
 */
const generateCSVReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        console.log(`CSV report requested for ${month}/${year}`);
        
        // TODO: Implement full CSV generation logic here
        // For now, return a success message to prevent the route from crashing
        res.status(200).json({ 
            success: true, 
            message: `CSV report for ${month}/${year} - Feature coming soon!` 
        });
    } catch (error) {
        console.error('Error generating CSV report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

// ========== EXPORT ALL FUNCTIONS ==========
module.exports = {
    // Dashboard
    getDashboardStats,
    
    // Student Management
    getStudents,
    addStudent,
    getStudentById,
    updateStudent,
    deleteStudent,
    
    // Attendance
    getAttendanceRecords,
    
    // Staff Management
    getStaffMembers,
    
    // Subject Management
    getAllSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
    
    // Staff-Subject Assignment
    assignStaffToSubject,
    getAssignments,
    removeAssignment,
    
    // Export Functions (CRITICAL: These were missing and causing the error)
    generateExcelReport,
    generateCSVReport
};
