import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ViewAttendance = () => {
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Fetch subjects and teachers on component mount
  useEffect(() => {
    fetchSubjectsAndTeachers();
  }, []);

  const fetchSubjectsAndTeachers = async () => {
    try {
      const [subjectsRes, teachersRes] = await Promise.all([
        adminAPI.getSubjects(),
        adminAPI.getStaff()
      ]);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await adminAPI.getAttendance(filters);
      setAttendanceData(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel with Subject, Teacher, and Month details
  const exportToExcel = () => {
    if (!attendanceData || !attendanceData.students) {
      toast.error('No data to export');
      return;
    }

    try {
      const monthName = months[filters.month - 1];
      
      // Prepare data for Excel with subject and teacher info
      const exportData = attendanceData.students.map(student => ({
        'Roll Number': student.roll_number,
        'Student Name': student.student_name,
        'Branch': student.branch || '-',
        'Year': student.year,
        'Month': monthName,
        'Year': filters.year,
        'Present Days': student.total_attendance,
        'Total Days': student.total_days,
        'Percentage (%)': student.percentage,
        'Status': parseFloat(student.percentage) >= 75 ? 'Eligible' : parseFloat(student.percentage) >= 60 ? 'Average' : 'Low Attendance'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Roll Number
        { wch: 25 }, // Student Name
        { wch: 15 }, // Branch
        { wch: 8 },  // Year
        { wch: 12 }, // Month
        { wch: 8 },  // Year
        { wch: 12 }, // Present Days
        { wch: 12 }, // Total Days
        { wch: 15 }, // Percentage
        { wch: 15 }  // Status
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Attendance_${monthName}_${filters.year}`);

      // Add summary sheet
      const summaryData = [
        { 'Report Type': 'Attendance Report', 'Value': `${monthName} ${filters.year}` },
        { 'Report Type': 'Total Students', 'Value': attendanceData.students.length },
        { 'Report Type': 'Average Attendance', 'Value': (attendanceData.students.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / attendanceData.students.length).toFixed(2) + '%' },
        { 'Report Type': 'Students Above 75%', 'Value': attendanceData.students.filter(s => parseFloat(s.percentage) >= 75).length },
        { 'Report Type': 'Students Below 60%', 'Value': attendanceData.students.filter(s => parseFloat(s.percentage) < 60).length },
        { 'Report Type': 'Generated On', 'Value': new Date().toLocaleString() }
      ];
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // Add subjects sheet if subjects exist
      if (subjects.length > 0) {
        const subjectsData = subjects.map(subject => ({
          'Subject Code': subject.subject_code,
          'Subject Name': subject.subject_name,
          'Category': 'Active'
        }));
        const wsSubjects = XLSX.utils.json_to_sheet(subjectsData);
        XLSX.utils.book_append_sheet(wb, wsSubjects, 'Subjects');
      }

      // Add teachers sheet if teachers exist
      if (teachers.length > 0) {
        const teachersData = teachers.map(teacher => ({
          'Teacher Name': teacher.full_name,
          'Username': teacher.username,
          'Email': teacher.email,
          'Role': teacher.role
        }));
        const wsTeachers = XLSX.utils.json_to_sheet(teachersData);
        XLSX.utils.book_append_sheet(wb, wsTeachers, 'Teachers');
      }

      // Generate filename
      const filename = `Attendance_Report_${monthName}_${filters.year}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  // Export to CSV with complete details
  const exportToCSV = () => {
    if (!attendanceData || !attendanceData.students) {
      toast.error('No data to export');
      return;
    }

    try {
      const monthName = months[filters.month - 1];
      
      // Prepare headers
      const headers = [
        'Roll Number', 'Student Name', 'Branch', 'Year', 
        'Month', 'Report Year', 'Present Days', 'Total Days', 
        'Percentage (%)', 'Status'
      ];
      
      // Prepare rows
      const rows = attendanceData.students.map(student => [
        student.roll_number,
        student.student_name,
        student.branch || '-',
        student.year,
        monthName,
        filters.year,
        student.total_attendance,
        student.total_days,
        student.percentage,
        parseFloat(student.percentage) >= 75 ? 'Eligible' : parseFloat(student.percentage) >= 60 ? 'Average' : 'Low Attendance'
      ]);

      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        const formattedRow = row.map(cell => {
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        });
        csvContent += formattedRow.join(',') + '\n';
      });

      // Add summary section
      csvContent += '\n"--- SUMMARY ---"\n';
      csvContent += `"Total Students",${attendanceData.students.length}\n`;
      csvContent += `"Average Attendance","${(attendanceData.students.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / attendanceData.students.length).toFixed(2)}%"\n`;
      csvContent += `"Students Above 75%",${attendanceData.students.filter(s => parseFloat(s.percentage) >= 75).length}\n`;
      csvContent += `"Students Below 60%",${attendanceData.students.filter(s => parseFloat(s.percentage) < 60).length}\n`;
      csvContent += `"Generated On","${new Date().toLocaleString()}"\n`;

      // Add subjects section
      if (subjects.length > 0) {
        csvContent += '\n"--- SUBJECTS ---"\n';
        csvContent += '"Subject Code","Subject Name"\n';
        subjects.forEach(subject => {
          csvContent += `"${subject.subject_code}","${subject.subject_name}"\n`;
        });
      }

      // Add teachers section
      if (teachers.length > 0) {
        csvContent += '\n"--- TEACHERS ---"\n';
        csvContent += '"Teacher Name","Username","Email","Role"\n';
        teachers.forEach(teacher => {
          csvContent += `"${teacher.full_name}","${teacher.username}","${teacher.email}","${teacher.role}"\n`;
        });
      }

      // Add BOM for UTF-8 encoding
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Attendance_Report_${monthName}_${filters.year}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  const getPercentageClass = (percentage) => {
    if (percentage >= 75) return 'percentage-high';
    if (percentage >= 60) return 'percentage-medium';
    return 'percentage-low';
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>View Attendance</h2>
      
      <div className="filter-bar">
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>
          <div className="filter-group">
            <label>Select Month</label>
            <select name="month" value={filters.month} onChange={handleFilterChange}>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Select Year</label>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          
          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn" style={{ width: 'auto' }}>
              📊 View Report
            </button>
          </div>
        </form>
      </div>

      {/* Display current filters info */}
      {attendanceData && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: '10px 15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>📅 Report for:</strong> {months[filters.month - 1]} {filters.year}
            &nbsp;| <strong>👨‍🎓 Total Students:</strong> {attendanceData.students.length}
            &nbsp;| <strong>📚 Total Subjects:</strong> {subjects.length}
            &nbsp;| <strong>👨‍🏫 Total Teachers:</strong> {teachers.length}
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {attendanceData && (
        <>
          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end' }}>
            <button 
              onClick={exportToExcel} 
              className="btn" 
              style={{ 
                width: 'auto', 
                background: '#28a745',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📊 Export to Excel (with Subjects & Teachers)
            </button>
            <button 
              onClick={exportToCSV} 
              className="btn" 
              style={{ 
                width: 'auto', 
                background: '#17a2b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📄 Export to CSV (Complete Report)
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Present Days</th>
                  <th>Total Days</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.students.map((student) => {
                  const percentage = parseFloat(student.percentage);
                  const status = percentage >= 75 ? '✅ Eligible' : percentage >= 60 ? '⚠️ Average' : '❌ Low';
                  return (
                    <tr key={student.id}>
                      <td>{student.roll_number}</td>
                      <td>{student.student_name}</td>
                      <td>{student.branch || '-'}</td>
                      <td>{student.year}</td>
                      <td>{months[filters.month - 1]}</td>
                      <td>{student.total_attendance}</td>
                      <td>{student.total_days}</td>
                      <td className={getPercentageClass(percentage)}>
                        {student.percentage}%
                      </td>
                      <td>{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="stats-grid" style={{ marginTop: '20px' }}>
            <div className="stat-card">
              <h3>Average Attendance</h3>
              <div className="stat-number">
                {(attendanceData.students.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / attendanceData.students.length).toFixed(2)}%
              </div>
            </div>
            <div className="stat-card">
              <h3>Students Above 75%</h3>
              <div className="stat-number" style={{ color: '#28a745' }}>
                {attendanceData.students.filter(s => parseFloat(s.percentage) >= 75).length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Students Below 60%</h3>
              <div className="stat-number" style={{ color: '#dc3545' }}>
                {attendanceData.students.filter(s => parseFloat(s.percentage) < 60).length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Total Subjects</h3>
              <div className="stat-number" style={{ color: '#17a2b8' }}>
                {subjects.length}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAttendance;