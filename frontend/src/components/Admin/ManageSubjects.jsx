import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await adminAPI.getAllSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject_code || !formData.subject_name) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      if (editingSubject) {
        await adminAPI.updateSubject(editingSubject._id, formData);
        toast.success('Subject updated successfully!');
      } else {
        await adminAPI.addSubject(formData);
        toast.success('Subject added successfully!');
      }
      setShowModal(false);
      setFormData({ subject_code: '', subject_name: '' });
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setLoading(true);
    try {
      await adminAPI.deleteSubject(deleteConfirm._id);
      toast.success('Subject deleted successfully!');
      setDeleteConfirm(null);
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to delete subject');
    } finally {
      setLoading(false);
    }
  };

  if (loading && subjects.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Manage Subjects</h2>
        <button 
          className="btn" 
          style={{ width: 'auto' }} 
          onClick={() => {
            setEditingSubject(null);
            setFormData({ subject_code: '', subject_name: '' });
            setShowModal(true);
          }}
        >
          + Add New Subject
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>📚 Total Subjects</h3>
          <div className="stat-number" style={{ color: '#667eea' }}>{subjects.length}</div>
        </div>
        <div className="stat-card">
          <h3>🆕 Recently Added</h3>
          <div className="stat-number" style={{ color: '#48bb78' }}>
            {subjects.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </div>
        </div>
        <div className="stat-card">
          <h3>📖 Active Subjects</h3>
          <div className="stat-number" style={{ color: '#ed8936' }}>{subjects.length}</div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={subject._id}>
                <td data-label="#">{index + 1}</td>
                <td data-label="Subject Code"><strong>{subject.subject_code}</strong></td>
                <td data-label="Subject Name">{subject.subject_name}</td>
                <td data-label="Created Date">{new Date(subject.created_at).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEdit(subject)}
                    style={{ marginRight: '5px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => setDeleteConfirm(subject)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  No subjects found. Click "Add New Subject" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
              <span className="modal-close" onClick={() => setShowModal(false)}>×</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject Code *</label>
                <input
                  type="text"
                  name="subject_code"
                  value={formData.subject_code}
                  onChange={handleChange}
                  placeholder="e.g., CS101, MATH201"
                  required
                  style={{ textTransform: 'uppercase' }}
                />
                <small style={{ color: '#666' }}>Unique identifier for the subject</small>
              </div>
              
              <div className="form-group">
                <label>Subject Name *</label>
                <input
                  type="text"
                  name="subject_name"
                  value={formData.subject_name}
                  onChange={handleChange}
                  placeholder="e.g., Programming Fundamentals"
                  required
                />
                <small style={{ color: '#666' }}>Full name of the subject</small>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Add Subject')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <span className="modal-close" onClick={() => setDeleteConfirm(null)}>×</span>
            </div>
            <p>Are you sure you want to delete <strong>{deleteConfirm.subject_code} - {deleteConfirm.subject_name}</strong>?</p>
            <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '10px' }}>
              ⚠️ This will also remove all staff and student assignments for this subject.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button className="btn btn-delete" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete'}
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

export default ManageSubjects;