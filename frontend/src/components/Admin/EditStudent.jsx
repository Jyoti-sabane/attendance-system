import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const EditStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const studentId = new URLSearchParams(location.search).get('id');
  
  const [formData, setFormData] = useState({
    roll_number: '',
    student_name: '',
    email: '',
    branch: '',
    year: 1
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    } else {
      navigate('/admin/manage_students');
    }
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const response = await adminAPI.getStudent(studentId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to fetch student');
      navigate('/admin/manage_students');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await adminAPI.updateStudent(studentId, formData);
      toast.success('Student updated successfully');
      navigate('/admin/manage_students');
    } catch (error) {
      toast.error('Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Edit Student</h2>
      <div className="table-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Roll Number *</label>
            <input
              type="text"
              name="roll_number"
              value={formData.roll_number}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Student Name *</label>
            <input
              type="text"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Branch</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Year</label>
            <select name="year" value={formData.year} onChange={handleChange}>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Student'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/manage_students')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;