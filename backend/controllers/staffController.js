const StaffSubject = require('../models/StaffSubject');
const Student = require('../models/Student');
const StudentSubject = require('../models/StudentSubject');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

const getAssignedSubjects = async (req, res) => {
    try {
        const staff_id = req.session.user.user_id;
        const assignments = await StaffSubject.find({ staff_id }).populate('subject_id');
        const subjects = assignments.map(a => ({
            subject_id: a.subject_id._id,
            subject_code: a.subject_id.subject_code,
            subject_name: a.subject_id.subject_name
        }));
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ roll_number: 1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const assignStudentsToSubject = async (req, res) => {
    try {
        const { subject_id, students } = req.body;
        const staff_id = req.session.user.user_id;
        
        let success_count = 0;
        
        for (const student_id of students) {
            const existing = await StudentSubject.findOne({ student_id, subject_id });
            if (!existing) {
                const assignment = new StudentSubject({ student_id, subject_id, staff_id });
                await assignment.save();
                success_count++;
            }
        }
        
        res.json({ success: true, message: `${success_count} student(s) assigned successfully!` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAssignedStudents = async (req, res) => {
    try {
        const staff_id = req.session.user.user_id;
        const assignments = await StudentSubject.find({ staff_id })
            .populate('student_id', 'roll_number student_name')
            .populate('subject_id', 'subject_code subject_name');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSubjectStudents = async (req, res) => {
    try {
        const { subject_id } = req.params;
        const staff_id = req.session.user.user_id;
        
        const students = await StudentSubject.find({ subject_id, staff_id })
            .populate('student_id');
        
        const today = new Date().toISOString().split('T')[0];
        const existingAttendance = await Attendance.find({
            subject_id,
            attendance_date: { $gte: new Date(today), $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)) }
        });
        
        const attendanceMap = {};
        for (const att of existingAttendance) {
            attendanceMap[att.student_id.toString()] = att.status;
        }
        
        const result = students.map(s => ({
            _id: s.student_id._id,
            roll_number: s.student_id.roll_number,
            student_name: s.student_id.student_name,
            current_status: attendanceMap[s.student_id._id.toString()] || null
        }));
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const saveAttendance = async (req, res) => {
    try {
        const { subject_id, attendance_date, lecture_number, attendance } = req.body;
        const staff_id = req.session.user.user_id;
        const attendance_time = new Date().toLocaleTimeString();
        
        let success_count = 0;
        
        for (const [student_id, status] of Object.entries(attendance)) {
            const existing = await Attendance.findOne({
                student_id,
                subject_id,
                attendance_date: new Date(attendance_date),
                lecture_number: parseInt(lecture_number)
            });
            
            if (existing) {
                existing.status = status;
                existing.attendance_time = attendance_time;
                await existing.save();
            } else {
                const record = new Attendance({
                    student_id,
                    subject_id,
                    staff_id,
                    attendance_date: new Date(attendance_date),
                    attendance_time,
                    status,
                    lecture_number: parseInt(lecture_number)
                });
                await record.save();
            }
            success_count++;
        }
        
        res.json({ success: true, message: `Attendance marked for ${success_count} students!` });
    } catch (error) {
        console.error('Save attendance error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAttendanceReport = async (req, res) => {
    try {
        const { subject_id, month, year } = req.query;
        const staff_id = req.session.user.user_id;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const students = await StudentSubject.find({ subject_id, staff_id })
            .populate('student_id');
        
        const allLectures = await Attendance.aggregate([
            {
                $match: {
                    subject_id: new mongoose.Types.ObjectId(subject_id),
                    attendance_date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$attendance_date" } },
                        lecture: "$lecture_number"
                    }
                }
            }
        ]);
        
        const totalLectures = allLectures.length;
        
        const report = [];
        for (const enrollment of students) {
            const student = enrollment.student_id;
            
            const attendanceRecords = await Attendance.find({
                student_id: student._id,
                subject_id,
                attendance_date: { $gte: startDate, $lte: endDate }
            });
            
            const totalPresent = attendanceRecords.filter(a => a.status === 'present').length;
            
            let percentage = 0;
            if (totalLectures > 0) {
                percentage = (totalPresent / totalLectures) * 100;
            }
            
            report.push({
                roll_number: student.roll_number,
                student_name: student.student_name,
                total_present: totalPresent,
                total_days: totalLectures,
                percentage: percentage.toFixed(2)
            });
        }
        
        res.json({ report, total_lectures: totalLectures });
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAssignedSubjects,
    getAllStudents,
    assignStudentsToSubject,
    getAssignedStudents,
    getSubjectStudents,
    saveAttendance,
    getAttendanceReport
};