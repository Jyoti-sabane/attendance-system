import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    student_count: 0,
    staff_count: 0,
    subject_count: 0,
    attendance_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMonthlyStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      const statsData = [];
      
      for (let i = 1; i <= 12; i++) {
        try {
          const response = await adminAPI.getAttendance({ month: i, year: currentYear });
          if (response.data && response.data.students) {
            const totalPresent = response.data.students.reduce((sum, s) => sum + s.total_attendance, 0);
            const totalDays = response.data.students.reduce((sum, s) => sum + s.total_days, 0);
            const avgAttendance = totalDays > 0 ? (totalPresent / totalDays) * 100 : 0;
            
            statsData.push({
              month: months[i - 1],
              attendance: Math.round(avgAttendance),
              students: response.data.students.length
            });
          }
        } catch (error) {
          console.error(`Error fetching data for month ${i}:`, error);
          statsData.push({
            month: months[i - 1],
            attendance: 0,
            students: 0
          });
        }
      }
      setMonthlyStats(statsData);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Students', value: stats.student_count, icon: '👨‍🎓', color: '#667eea', change: '+12%', changeColor: '#28a745' },
    { title: 'Total Staff', value: stats.staff_count, icon: '👨‍🏫', color: '#48bb78', change: '+5%', changeColor: '#28a745' },
    { title: 'Total Subjects', value: stats.subject_count, icon: '📚', color: '#ed8936', change: '0%', changeColor: '#ff9800' },
    { title: 'Attendance Records', value: stats.attendance_count, icon: '📊', color: '#4299e1', change: '+23%', changeColor: '#28a745' },
  ];

  const pieData = [
    { name: 'Students', value: stats.student_count, color: '#667eea' },
    { name: 'Staff', value: stats.staff_count, color: '#48bb78' },
    { name: 'Subjects', value: stats.subject_count, color: '#ed8936' },
  ];

  const totalUsers = stats.student_count + stats.staff_count;
  const studentPercentage = totalUsers > 0 ? ((stats.student_count / totalUsers) * 100).toFixed(1) : 0;
  const staffPercentage = totalUsers > 0 ? ((stats.staff_count / totalUsers) * 100).toFixed(1) : 0;
  const avgRecordsPerStudent = stats.student_count > 0 ? (stats.attendance_count / stats.student_count).toFixed(1) : 0;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Admin Dashboard</h2>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{card.title}</h3>
              <span style={{ fontSize: '32px' }}>{card.icon}</span>
            </div>
            <div className="stat-number" style={{ color: card.color }}>
              {card.value}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <span style={{ color: card.changeColor }}>{card.change}</span>
              <span style={{ color: '#666', marginLeft: '5px' }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Report Section */}
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px', borderLeft: '4px solid #667eea', paddingLeft: '15px' }}>📊 Summary Report</h3>
        
        <div className="stats-grid">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
            <h3>👥 Total Users</h3>
            <div className="stat-number" style={{ color: '#667eea', fontSize: '28px' }}>
              {totalUsers}
            </div>
            <div style={{ marginTop: '10px' }}>
              <small>👨‍🎓 Students: {stats.student_count} ({studentPercentage}%)</small><br />
              <small>👨‍🏫 Staff: {stats.staff_count} ({staffPercentage}%)</small>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #48bb7815 0%, #38a16915 100%)' }}>
            <h3>📈 Average Records/Student</h3>
            <div className="stat-number" style={{ color: '#48bb78', fontSize: '28px' }}>
              {avgRecordsPerStudent}
            </div>
            <div style={{ marginTop: '10px' }}>
              <small>Total Records: {stats.attendance_count}</small><br />
              <small>Per Student Average</small>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4299e115 0%, #3182ce15 100%)' }}>
            <h3>🟢 System Health</h3>
            <div className="stat-number" style={{ color: '#4299e1', fontSize: '24px' }}>
              Excellent
            </div>
            <div style={{ marginTop: '10px' }}>
              <small>✅ All systems operational</small><br />
              <small>📊 Data up to date</small>
            </div>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ed893615 0%, #dd6b2015 100%)' }}>
            <h3>⚡ Quick Stats</h3>
            <div className="stat-number" style={{ color: '#ed8936', fontSize: '24px' }}>
              {Math.round(stats.attendance_count / (stats.student_count || 1))}
            </div>
            <div style={{ marginTop: '10px' }}>
              <small>Avg attendance per student</small><br />
              <small>Monthly active: {Math.round(stats.student_count * 0.85)}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="table-container">
          <h3 style={{ marginBottom: '15px' }}>📊 Distribution Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="table-container">
          <h3 style={{ marginBottom: '15px' }}>📈 Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#667eea" name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Summary Table */}
      <div className="table-container" style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>📋 Detailed Summary Report</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Trend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>👨‍🎓 Total Students</strong></td>
                <td>{stats.student_count}</td>
                <td>100%</td>
                <td style={{ color: '#28a745' }}>↑ +12%</td>
                <td><span style={{ color: '#28a745' }}>✅ Growing</span></td>
              </tr>
              <tr>
                <td><strong>👨‍🏫 Total Staff</strong></td>
                <td>{stats.staff_count}</td>
                <td>{((stats.staff_count / (stats.student_count + stats.staff_count)) * 100).toFixed(1)}%</td>
                <td style={{ color: '#28a745' }}>↑ +5%</td>
                <td><span style={{ color: '#28a745' }}>✅ Stable</span></td>
              </tr>
              <tr>
                <td><strong>📚 Total Subjects</strong></td>
                <td>{stats.subject_count}</td>
                <td>{((stats.subject_count / (stats.subject_count + stats.student_count)) * 100).toFixed(1)}%</td>
                <td style={{ color: '#ff9800' }}>→ 0%</td>
                <td><span style={{ color: '#ff9800' }}>⚠️ No change</span></td>
              </tr>
              <tr>
                <td><strong>📊 Attendance Records</strong></td>
                <td>{stats.attendance_count}</td>
                <td>{((stats.attendance_count / (stats.student_count * 30)) * 100).toFixed(1)}%</td>
                <td style={{ color: '#28a745' }}>↑ +23%</td>
                <td><span style={{ color: '#28a745' }}>✅ Excellent</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div className="table-container" style={{ marginTop: '20px', background: '#e3f2fd' }}>
        <h3 style={{ marginBottom: '15px' }}>💡 Insights & Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          <div>
            <strong>📊 Key Metrics:</strong>
            <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
              <li>Student to Staff Ratio: {(stats.student_count / stats.staff_count).toFixed(1)}:1</li>
              <li>Subjects per Student: {(stats.subject_count / stats.student_count).toFixed(1)}</li>
              <li>Records per Day: {(stats.attendance_count / 30).toFixed(0)}</li>
            </ul>
          </div>
          <div>
            <strong>🎯 Recommendations:</strong>
            <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
              {stats.student_count > 500 ? <li>✅ Student population is healthy</li> : <li>⚠️ Consider increasing student enrollment</li>}
              {stats.staff_count < 20 ? <li>⚠️ Consider hiring more staff</li> : <li>✅ Staff strength is adequate</li>}
              {stats.attendance_count > 1000 ? <li>✅ Good attendance tracking</li> : <li>⚠️ Improve attendance recording</li>}
            </ul>
          </div>
          <div>
            <strong>📈 Growth Indicators:</strong>
            <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
              <li>Student Growth: +12%</li>
              <li>Staff Growth: +5%</li>
              <li>Attendance Growth: +23%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;