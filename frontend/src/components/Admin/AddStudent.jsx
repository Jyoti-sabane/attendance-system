import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roll_number: '',
    student_name: '',
    email: '',
    branch: '',
    year: 1
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await adminAPI.addStudent(formData);
      toast.success('Student added successfully');
      navigate('/admin/manage_students');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Add New Student</h2>
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
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
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

export default AddStudent;