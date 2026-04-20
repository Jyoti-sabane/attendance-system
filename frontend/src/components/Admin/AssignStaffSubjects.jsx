import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AssignStaffSubjects = () => {
  const [staff, setStaff] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    staff_id: '',
    subject_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching staff...');
      const staffRes = await adminAPI.getStaff();
      console.log('Staff response:', staffRes.data);
      setStaff(staffRes.data || []);
      
      console.log('Fetching subjects...');
      const subjectsRes = await adminAPI.getSubjects();
      console.log('Subjects response:', subjectsRes.data);
      setSubjects(subjectsRes.data || []);
      
      console.log('Fetching assignments...');
      const assignmentsRes = await adminAPI.getAssignments();
      console.log('Assignments response:', assignmentsRes.data);
      setAssignments(assignmentsRes.data || []);
      
      if (staffRes.data.length === 0) {
        toast.error('No staff members found. Please register staff first.');
      }
      if (subjectsRes.data.length === 0) {
        toast.error('No subjects found. Please add subjects first.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staff_id || !formData.subject_id) {
      toast.error('Please select both staff and subject');
      return;
    }
    
    try {
      await adminAPI.assignStaff(formData);
      toast.success('Staff assigned to subject successfully');
      setFormData({ staff_id: '', subject_id: '' });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.error || 'Failed to assign');
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await adminAPI.removeAssignment(id);
        toast.success('Assignment removed successfully');
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Remove error:', error);
        toast.error('Failed to remove assignment');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Assign Staff to Subjects</h2>
      
      {/* Show warning if no data */}
      {staff.length === 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
          ⚠️ No staff members found. Please register staff members first.
        </div>
      )}
      
      {subjects.length === 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
          ⚠️ No subjects found. Please add subjects first.
        </div>
      )}
      
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>New Assignment</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Select Staff</label>
            <select name="staff_id" value={formData.staff_id} onChange={handleChange} required disabled={staff.length === 0}>
              <option value="">-- Select Staff --</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>{s.full_name} ({s.username})</option>
              ))}
            </select>
            {staff.length === 0 && <small style={{ color: '#dc3545' }}>No staff available. Register staff first.</small>}
          </div>
          
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Select Subject</label>
            <select name="subject_id" value={formData.subject_id} onChange={handleChange} required disabled={subjects.length === 0}>
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
            {subjects.length === 0 && <small style={{ color: '#dc3545' }}>No subjects available. Add subjects first.</small>}
          </div>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn" style={{ width: 'auto' }} disabled={staff.length === 0 || subjects.length === 0}>
              Assign
            </button>
          </div>
        </form>
      </div>
      
      <div className="table-container">
        <h3 style={{ marginBottom: '15px' }}>Current Assignments</h3>
        {assignments.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No assignments found. Use the form above to assign staff to subjects.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Username</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td data-label="Staff Name">{assignment.staff_id?.full_name || '-'}</td>
                  <td data-label="Username">{assignment.staff_id?.username || '-'}</td>
                  <td data-label="Subject Code">{assignment.subject_id?.subject_code || '-'}</td>
                  <td data-label="Subject Name">{assignment.subject_id?.subject_name || '-'}</td>
                  <td data-label="Actions">
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleRemove(assignment._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssignStaffSubjects;