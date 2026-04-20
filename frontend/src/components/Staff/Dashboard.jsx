import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSubjectStats, setAllSubjectStats] = useState({});

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    fetchSubjectsAndStats();
  }, []);

  const fetchSubjectsAndStats = async () => {
    setLoading(true);
    try {
      const response = await staffAPI.getSubjects();
      const subjectsData = response.data;
      setSubjects(subjectsData);
      
      // Fetch statistics for each subject automatically
      const statsMap = {};
      for (const subject of subjectsData) {
        try {
          const statsResponse = await staffAPI.getAttendanceReport({
            subject_id: subject.subject_id,
            month: currentMonth,
            year: currentYear
          });
          
          const reportData = statsResponse.data;
          const students = reportData.report || [];
          const totalDays = reportData.total_lectures || 0;
          
          // Calculate statistics
          const totalStudents = students.length;
          let totalPercentageSum = 0;
          let below75Count = 0;
          let below60Count = 0;
          let below30Count = 0;
          let above75Count = 0;
          
          students.forEach(student => {
            const percentage = parseFloat(student.percentage);
            totalPercentageSum += percentage;
            
            if (percentage < 30) below30Count++;
            if (percentage < 60) below60Count++;
            if (percentage < 75) below75Count++;
            if (percentage >= 75) above75Count++;
          });
          
          const averageAttendance = totalStudents > 0 ? 
            (totalPercentageSum / totalStudents).toFixed(2) : 0;
          
          statsMap[subject.subject_id] = {
            students,
            totalStudents,
            totalDays,
            averageAttendance,
            below75: below75Count,
            below60: below60Count,
            below30: below30Count,
            above75: above75Count,
            studentsList: students
          };
          
        } catch (error) {
          console.error(`Error fetching stats for subject ${subject.subject_id}:`, error);
          statsMap[subject.subject_id] = {
            students: [],
            totalStudents: 0,
            totalDays: 0,
            averageAttendance: 0,
            below75: 0,
            below60: 0,
            below30: 0,
            above75: 0,
            studentsList: []
          };
        }
      }
      
      setAllSubjectStats(statsMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { text: 'Good', color: '#28a745', class: 'percentage-high' };
    if (percentage >= 60) return { text: 'Average', color: '#ff9800', class: 'percentage-medium' };
    if (percentage >= 30) return { text: 'Poor', color: '#dc3545', class: 'percentage-low' };
    return { text: 'Critical', color: '#8B0000', class: 'percentage-critical' };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Staff Dashboard</h2>
      
      {/* Current Month Info */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '15px 20px', 
        borderRadius: '10px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>📅 Current Month: {months[currentMonth - 1]} {currentYear}</h3>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Attendance statistics for all your subjects</p>
        </div>
        <div style={{ fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '5px' }}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {/* Assigned Subjects Card */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>📚 Your Assigned Subjects</h3>
          <div className="stat-number" style={{ color: '#667eea' }}>
            {subjects.length}
          </div>
        </div>
      </div>
      
      {/* Subjects and their Statistics */}
      {subjects.length > 0 && (
        <div>
          {subjects.map((subject) => {
            const stats = allSubjectStats[subject.subject_id];
            if (!stats) return null;
            
            return (
              <div key={subject.subject_id} style={{ marginBottom: '30px' }}>
                {/* Subject Header */}
                <div style={{ 
                  background: '#2c3e50', 
                  color: 'white', 
                  padding: '12px 20px', 
                  borderRadius: '10px 10px 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{subject.subject_code} - {subject.subject_name}</h3>
                  </div>
                  <div style={{ fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '5px' }}>
                    Total Students: {stats.totalStudents}
                  </div>
                </div>
                
                {/* Statistics Cards for this subject */}
                <div className="stats-grid" style={{ marginTop: '0', borderRadius: '0 0 10px 10px' }}>
                  <div className="stat-card">
                    <h3>📆 Working Days</h3>
                    <div className="stat-number" style={{ color: '#17a2b8', fontSize: '28px' }}>
                      {stats.totalDays}
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>📈 Average Attendance</h3>
                    <div className="stat-number" style={{ color: '#ff9800', fontSize: '28px' }}>
                      {stats.averageAttendance}%
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>✅ Above 75%</h3>
                    <div className="stat-number" style={{ color: '#28a745', fontSize: '28px' }}>
                      {stats.above75}
                    </div>
                    <small>{stats.totalStudents > 0 ? ((stats.above75 / stats.totalStudents) * 100).toFixed(1) : 0}% of class</small>
                  </div>
                  
                  <div className="stat-card">
                    <h3>⚠️ Below 75%</h3>
                    <div className="stat-number" style={{ color: '#ff9800', fontSize: '28px' }}>
                      {stats.below75}
                    </div>
                    <small>{stats.totalStudents > 0 ? ((stats.below75 / stats.totalStudents) * 100).toFixed(1) : 0}% of class</small>
                  </div>
                  
                  <div className="stat-card">
                    <h3>🔴 Below 60%</h3>
                    <div className="stat-number" style={{ color: '#dc3545', fontSize: '28px' }}>
                      {stats.below60}
                    </div>
                    <small>{stats.totalStudents > 0 ? ((stats.below60 / stats.totalStudents) * 100).toFixed(1) : 0}% of class</small>
                  </div>
                  
                  <div className="stat-card">
                    <h3>⚠️ Below 30%</h3>
                    <div className="stat-number" style={{ color: '#8B0000', fontSize: '28px' }}>
                      {stats.below30}
                    </div>
                    <small style={{ color: '#8B0000' }}>
                      {stats.totalStudents > 0 ? ((stats.below30 / stats.totalStudents) * 100).toFixed(1) : 0}% of class
                    </small>
                  </div>
                </div>
                
                {/* Below 30% Alert */}
                {stats.below30 > 0 && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '12px', 
                    background: '#f8d7da', 
                    borderRadius: '5px', 
                    color: '#721c24',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    <strong>⚠️ CRITICAL ALERT:</strong> {stats.below30} student(s) have attendance below 30% and are at risk of debarment!
                  </div>
                )}
                
                {/* Student-wise Attendance Table */}
                <div className="table-container" style={{ marginTop: '15px' }}>
                  <h3 style={{ marginBottom: '15px' }}>Student-wise Attendance ({months[currentMonth - 1]} {currentYear})</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr style={{ background: '#f8f9fa' }}>
                          <th>Sr. No.</th>
                          <th>Roll Number</th>
                          <th>Student Name</th>
                          <th>Present Days</th>
                          <th>Total Days</th>
                          <th>Percentage</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.studentsList.map((student, idx) => {
                          const percentage = parseFloat(student.percentage);
                          const status = getAttendanceStatus(percentage);
                          return (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>{student.roll_number}</td>
                              <td style={{ textAlign: 'left' }}>{student.student_name}</td>
                              <td>{student.total_present}</td>
                              <td>{student.total_days}</td>
                              <td className={status.class}>
                                {student.percentage}%
                              </td>
                              <td style={{ color: status.color, fontWeight: 'bold' }}>
                                {status.text}
                              </td>
                            </tr>
                          );
                        })}
                        {stats.studentsList.length === 0 && (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No attendance data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Summary Section */}
                <div className="table-container" style={{ marginTop: '15px', background: '#f8f9fa' }}>
                  <h3>📝 Summary Report - {subject.subject_code}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '10px' }}>
                    <div>
                      <strong>📊 Class Performance:</strong>
                      <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                        <li>Total Students: {stats.totalStudents}</li>
                        <li>Total Lectures: {stats.totalDays}</li>
                        <li>Class Average: {stats.averageAttendance}%</li>
                      </ul>
                    </div>
                    <div>
                      <strong>📈 Attendance Distribution:</strong>
                      <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                        <li style={{ color: '#28a745' }}>Above 75%: {stats.above75} students</li>
                        <li style={{ color: '#ff9800' }}>60-75%: {stats.below75 - stats.below60} students</li>
                        <li style={{ color: '#dc3545' }}>30-60%: {stats.below60 - stats.below30} students</li>
                        <li style={{ color: '#8B0000', fontWeight: 'bold' }}>Below 30%: {stats.below30} students</li>
                      </ul>
                    </div>
                    <div>
                      <strong>⚠️ Recommendations:</strong>
                      <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                        {stats.below30 > 0 && <li style={{ color: '#8B0000' }}>Contact parents of students below 30%</li>}
                        {stats.below60 > 0 && <li>Conduct extra classes for weak students</li>}
                        {stats.above75 > stats.totalStudents / 2 && <li>Class performance is good</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {subjects.length === 0 && (
        <div className="table-container">
          <p style={{ textAlign: 'center', color: '#666' }}>No subjects assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;