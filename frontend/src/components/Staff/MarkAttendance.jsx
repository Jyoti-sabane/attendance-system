import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [lectureNumber, setLectureNumber] = useState(1);
  const [attendance, setAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectAllStatus, setSelectAllStatus] = useState('present');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await staffAPI.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await staffAPI.getSubjectStudents(selectedSubject);
      setStudents(response.data);
      const initialAttendance = {};
      // Set default to 'present' for all students
      response.data.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSelectAll = (status) => {
    const updatedAttendance = {};
    students.forEach(student => {
      updatedAttendance[student._id] = status;
    });
    setAttendance(updatedAttendance);
    setSelectAllStatus(status);
    toast.success(`All students marked as ${status}`);
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    
    if (students.length === 0) {
      toast.error('No students assigned to this subject');
      return;
    }
    
    setSubmitting(true);
    try {
      await staffAPI.saveAttendance({
        subject_id: selectedSubject,
        attendance_date: attendanceDate,
        lecture_number: lectureNumber,
        attendance: attendance
      });
      toast.success('Attendance marked successfully');
      // Reset to all present after save
      const resetAttendance = {};
      students.forEach(student => {
        resetAttendance[student._id] = 'present';
      });
      setAttendance(resetAttendance);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getLectureOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) {
      options.push(i);
    }
    return options;
  };

  // Calculate statistics
  const presentCount = Object.values(attendance).filter(status => status === 'present').length;
  const absentCount = students.length - presentCount;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Mark Attendance</h2>
      
      {/* Filters Section */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>📚 Select Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label>📅 Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label>🎓 Lecture Number</label>
            <select 
              value={lectureNumber} 
              onChange={(e) => setLectureNumber(parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px' }}
            >
              {getLectureOptions().map(num => (
                <option key={num} value={num}>Lecture {num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {selectedSubject && students.length > 0 && (
        <>
          {/* Quick Actions Bar */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '10px', 
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <strong>Quick Actions:</strong>
              <button 
                onClick={() => handleSelectAll('present')}
                style={{ 
                  marginLeft: '10px', 
                  padding: '5px 15px', 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✓ Mark All Present
              </button>
              <button 
                onClick={() => handleSelectAll('absent')}
                style={{ 
                  marginLeft: '10px', 
                  padding: '5px 15px', 
                  background: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✗ Mark All Absent
              </button>
            </div>
            <div>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>Present: {presentCount}</span>
              <span style={{ marginLeft: '15px', color: '#dc3545', fontWeight: 'bold' }}>Absent: {absentCount}</span>
              <span style={{ marginLeft: '15px', color: '#666' }}>Total: {students.length}</span>
            </div>
          </div>
          
          {/* Students Attendance Grid with Radio Buttons */}
          <div className="attendance-grid">
            {students.map((student) => (
              <div key={student._id} className="attendance-item" style={{ 
                padding: '15px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                background: 'white'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>{student.roll_number}</strong>
                  <div><small>{student.student_name}</small></div>
                </div>
                <div className="attendance-buttons" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    background: attendance[student._id] === 'present' ? '#d4edda' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      name={`attendance_${student._id}`}
                      value="present"
                      checked={attendance[student._id] === 'present'}
                      onChange={() => handleAttendanceChange(student._id, 'present')}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>Present</span>
                  </label>
                  
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    background: attendance[student._id] === 'absent' ? '#f8d7da' : 'transparent'
                  }}>
                    <input
                      type="radio"
                      name={`attendance_${student._id}`}
                      value="absent"
                      checked={attendance[student._id] === 'absent'}
                      onChange={() => handleAttendanceChange(student._id, 'absent')}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Absent</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          {/* Submit Button */}
          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button 
              className="btn" 
              onClick={handleSubmit} 
              disabled={submitting}
              style={{ 
                padding: '12px 40px', 
                fontSize: '16px',
                minWidth: '200px'
              }}
            >
              {submitting ? '💾 Saving...' : '💾 Save Attendance'}
            </button>
          </div>
        </>
      )}
      
      {selectedSubject && students.length === 0 && !loading && (
        <div className="table-container">
          <p style={{ textAlign: 'center', color: '#dc3545', padding: '40px' }}>
            ⚠️ No students assigned to this subject. Please assign students first.
          </p>
        </div>
      )}
      
      {!selectedSubject && (
        <div className="table-container">
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            📚 Please select a subject to mark attendance
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;