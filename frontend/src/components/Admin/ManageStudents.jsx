import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteStudent(id);
      toast.success('Student deleted successfully');
      fetchStudents();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Manage Students</h2>
        <button className="btn" style={{ width: 'auto' }} onClick={() => navigate('/admin/add_student')}>
          + Add New Student
        </button>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td data-label="Roll Number">{student.roll_number}</td>
                <td data-label="Student Name">{student.student_name}</td>
                <td data-label="Email">{student.email || '-'}</td>
                <td data-label="Branch">{student.branch || '-'}</td>
                <td data-label="Year">{student.year}</td>
                <td data-label="Actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => navigate(`/admin/edit_student?id=${student._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => setDeleteConfirm(student)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  No students found. Click "Add New Student" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <span className="modal-close" onClick={() => setDeleteConfirm(null)}>×</span>
            </div>
            <p>Are you sure you want to delete <strong>{deleteConfirm.student_name}</strong>?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button className="btn btn-delete" onClick={() => handleDelete(deleteConfirm._id)}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;