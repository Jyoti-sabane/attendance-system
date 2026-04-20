import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AssignStudents = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, studentsRes, assignedRes] = await Promise.all([
        staffAPI.getSubjects(),
        staffAPI.getAllStudents(),
        staffAPI.getAssignedStudents()
      ]);
      setSubjects(subjectsRes.data);
      setStudents(studentsRes.data);
      setAssignedStudents(assignedRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const availableStudentIds = students
        .filter(student => !getAssignedStudentIds().includes(student._id))
        .map(student => student._id);
      setSelectedStudents(availableStudentIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    try {
      await staffAPI.assignStudents({
        subject_id: selectedSubject,
        students: selectedStudents
      });
      toast.success(`${selectedStudents.length} student(s) assigned successfully`);
      setSelectedSubject('');
      setSelectedStudents([]);
      setSelectAll(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign students');
    }
  };

  const getAssignedStudentIds = () => {
    const assignments = assignedStudents.filter(a => a.subject_id?._id === selectedSubject);
    return assignments.map(a => a.student_id?._id);
  };

  const getAvailableStudents = () => {
    const assignedIds = getAssignedStudentIds();
    return students.filter(student => !assignedIds.includes(student._id));
  };

  if (loading) return <LoadingSpinner />;

  const assignedIds = getAssignedStudentIds();
  const availableStudents = getAvailableStudents();
  const assignedCount = assignedIds.length;
  const totalStudents = students.length;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Assign Students to Subjects</h2>
      
      {/* Subject Selection Card */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Step 1: Select Subject</h3>
        <div className="form-group">
          <label>Choose Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedStudents([]);
              setSelectAll(false);
            }}
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
        
        {selectedSubject && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '5px' }}>
            <strong>📊 Summary:</strong> Total Students: {totalStudents} | 
            Already Assigned: {assignedCount} | 
            Available: {availableStudents.length}
          </div>
        )}
      </div>
      
      {/* Students List with Checkboxes */}
      {selectedSubject && (
        <>
          <div className="table-container">
            <h3 style={{ marginBottom: '15px' }}>Step 2: Select Students to Assign</h3>
            
            {/* Select All Checkbox */}
            {availableStudents.length > 0 && (
              <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                background: '#f8f9fa', 
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  style={{ width: '20px', height: '20px' }}
                />
                <label style={{ margin: 0, fontWeight: 'bold' }}>
                  {selectAll ? 'Deselect All' : 'Select All Available Students'}
                </label>
                <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
                  {selectedStudents.length} of {availableStudents.length} selected
                </span>
              </div>
            )}
            
            {/* Students Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ width: '50px' }}>Select</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Already Assigned Students (shown but disabled) */}
                  {students.filter(s => assignedIds.includes(s._id)).map((student) => (
                    <tr key={student._id} style={{ opacity: 0.5, background: '#f0f0f0' }}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" disabled checked />
                      </td>
                      <td>{student.roll_number}</td>
                      <td>{student.student_name}</td>
                      <td>{student.branch || '-'}</td>
                      <td>{student.year}</td>
                      <td style={{ color: '#28a745' }}>✓ Already Assigned</td>
                    </tr>
                  ))}
                  
                  {/* Available Students (selectable) */}
                  {availableStudents.map((student) => (
                    <tr key={student._id}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => handleStudentSelect(student._id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td><strong>{student.roll_number}</strong></td>
                      <td>{student.student_name}</td>
                      <td>{student.branch || '-'}</td>
                      <td>{student.year}</td>
                      <td style={{ color: '#ff9800' }}>⭕ Available</td>
                    </tr>
                  ))}
                  
                  {availableStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                        <div>✅ All students have been assigned to this subject!</div>
                        <small style={{ color: '#666' }}>No available students to assign.</small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Add Button at the End */}
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Selected Students: {selectedStudents.length}</strong>
              {selectedStudents.length > 0 && (
                <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                  (Ready to assign)
                </span>
              )}
            </div>
            <button 
              className="btn" 
              onClick={handleSubmit}
              disabled={selectedStudents.length === 0}
              style={{ 
                width: 'auto', 
                padding: '12px 30px',
                fontSize: '16px',
                opacity: selectedStudents.length === 0 ? 0.5 : 1,
                cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              + Add Selected Students ({selectedStudents.length})
            </button>
          </div>
        </>
      )}
      
      {/* No Subject Selected Message */}
      {!selectedSubject && (
        <div className="table-container">
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Please select a subject to view and assign students.
          </p>
        </div>
      )}
    </div>
  );
};

export default AssignStudents;