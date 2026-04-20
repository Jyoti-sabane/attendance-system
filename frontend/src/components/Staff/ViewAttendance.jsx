import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const ViewAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const years = [];
  for (let i = 2020; i <= 2026; i++) {
    years.push(i);
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

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

  const fetchTeacherName = async (subjectId) => {
    try {
      const response = await staffAPI.getAssignedStudents();
      const assignment = response.data.find(a => a.subject_id?._id === subjectId);
      if (assignment && assignment.staff_id) {
        setTeacherName(assignment.staff_id.full_name || 'Staff Member');
      } else {
        setTeacherName('Not Assigned');
      }
    } catch (error) {
      setTeacherName('Unknown');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    
    const subject = subjects.find(s => s.subject_id === selectedSubject);
    if (subject) {
      setSelectedSubjectName(subject.subject_name);
      setSelectedSubjectCode(subject.subject_code);
    }
    
    await fetchTeacherName(selectedSubject);
    
    setLoading(true);
    try {
      const response = await staffAPI.getAttendanceReport({
        subject_id: selectedSubject,
        ...filters
      });
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!report || !report.report) {
      toast.error('No data to export');
      return;
    }

    try {
      const monthName = months[filters.month - 1];
      const totalStudents = report.report.length;
      const above75 = report.report.filter(s => parseFloat(s.percentage) >= 75).length;
      const between60_75 = report.report.filter(s => parseFloat(s.percentage) >= 60 && parseFloat(s.percentage) < 75).length;
      const between30_60 = report.report.filter(s => parseFloat(s.percentage) >= 30 && parseFloat(s.percentage) < 60).length;
      const below30 = report.report.filter(s => parseFloat(s.percentage) < 30).length;
      const avgAttendance = (report.report.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / totalStudents).toFixed(2);
      
      const wsData = [
        ['WALCHAND INSTITUTE OF TECHNOLOGY, SOLAPUR'],
        ['An Autonomous Institute'],
        ['Department of Information Technology'],
        [selectedSubjectCode + ' - ' + selectedSubjectName],
        ['Teacher: ' + teacherName],
        ['Attendance Report - ' + monthName + ' ' + filters.year],
        ['Generated on: ' + new Date().toLocaleString()],
        [],
        ['REPORT SUMMARY'],
        ['Total Students', totalStudents],
        ['Average Attendance', avgAttendance + '%'],
        ['Students Above 75%', above75, '(' + ((above75/totalStudents)*100).toFixed(1) + '%)'],
        ['Students Between 60-75%', between60_75, '(' + ((between60_75/totalStudents)*100).toFixed(1) + '%)'],
        ['Students Between 30-60%', between30_60, '(' + ((between30_60/totalStudents)*100).toFixed(1) + '%)'],
        ['Students Below 30%', below30, '(' + ((below30/totalStudents)*100).toFixed(1) + '%)'],
        [],
        ['DETAILED ATTENDANCE REPORT'],
        []
      ];
      
      wsData.push(['Sr. No.', 'Roll Number', 'Student Name', 'Present Days', 'Total Lectures', 'Attendance %', 'Status']);
      
      report.report.forEach((student, index) => {
        const percentage = parseFloat(student.percentage);
        let status = '';
        if (percentage >= 75) status = 'Good';
        else if (percentage >= 60) status = 'Average';
        else if (percentage >= 30) status = 'Poor';
        else status = 'Critical';
        
        wsData.push([
          index + 1,
          student.roll_number,
          student.student_name,
          student.total_present,
          student.total_days,
          student.percentage + '%',
          status
        ]);
      });
      
      if (below30 > 0) {
        wsData.push([]);
        wsData.push(['⚠️ ATTENTION: STUDENTS WITH ATTENDANCE BELOW 30% ⚠️']);
        wsData.push(['Roll Number', 'Student Name', 'Attendance %', 'Action Required']);
        
        report.report.forEach((student) => {
          const percentage = parseFloat(student.percentage);
          if (percentage < 30) {
            wsData.push([
              student.roll_number,
              student.student_name,
              student.percentage + '%',
              'Immediate Parent Meeting Required'
            ]);
          }
        });
      }
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws['!cols'] = [{ wch: 8 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Attendance_${monthName}_${filters.year}`);
      
      const filename = `Attendance_${selectedSubjectCode}_${monthName}_${filters.year}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success('Excel report downloaded successfully!');
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const exportToCSV = () => {
    if (!report || !report.report) {
      toast.error('No data to export');
      return;
    }

    try {
      const monthName = months[filters.month - 1];
      const totalStudents = report.report.length;
      const below30 = report.report.filter(s => parseFloat(s.percentage) < 30).length;
      const avgAttendance = (report.report.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / totalStudents).toFixed(2);
      
      let csvContent = `WALCHAND INSTITUTE OF TECHNOLOGY, SOLAPUR\n`;
      csvContent += `An Autonomous Institute\n`;
      csvContent += `Department of Information Technology\n`;
      csvContent += `${selectedSubjectCode} - ${selectedSubjectName}\n`;
      csvContent += `Teacher: ${teacherName}\n`;
      csvContent += `Attendance Report - ${monthName} ${filters.year}\n`;
      csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
      
      csvContent += `REPORT SUMMARY\n`;
      csvContent += `Total Students,${totalStudents}\n`;
      csvContent += `Average Attendance,${avgAttendance}%\n`;
      csvContent += `Students Below 30%,${below30}\n\n`;
      
      csvContent += `DETAILED ATTENDANCE REPORT\n`;
      csvContent += `Sr. No.,Roll Number,Student Name,Present Days,Total Lectures,Attendance %,Status\n`;
      
      report.report.forEach((student, index) => {
        const percentage = parseFloat(student.percentage);
        let status = '';
        if (percentage >= 75) status = 'Good';
        else if (percentage >= 60) status = 'Average';
        else if (percentage >= 30) status = 'Poor';
        else status = 'Critical';
        
        csvContent += `${index + 1},`;
        csvContent += `${student.roll_number},`;
        csvContent += `"${student.student_name}",`;
        csvContent += `${student.total_present},`;
        csvContent += `${student.total_days},`;
        csvContent += `${student.percentage}%,`;
        csvContent += `${status}\n`;
      });
      
      if (below30 > 0) {
        csvContent += `\n⚠️ STUDENTS WITH ATTENDANCE BELOW 30% ⚠️\n`;
        csvContent += `Roll Number,Student Name,Attendance %,Action Required\n`;
        report.report.forEach((student) => {
          const percentage = parseFloat(student.percentage);
          if (percentage < 30) {
            csvContent += `${student.roll_number},"${student.student_name}",${student.percentage}%,Immediate Parent Meeting Required\n`;
          }
        });
      }
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Attendance_${selectedSubjectCode}_${monthName}_${filters.year}.csv`);
      
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
    const p = parseFloat(percentage);
    if (p >= 75) return 'percentage-high';
    if (p >= 60) return 'percentage-medium';
    if (p >= 30) return 'percentage-low';
    return 'percentage-critical';
  };

  const getStatusText = (percentage) => {
    const p = parseFloat(percentage);
    if (p >= 75) return { text: 'Good', color: '#28a745' };
    if (p >= 60) return { text: 'Average', color: '#ff9800' };
    if (p >= 30) return { text: 'Poor', color: '#dc3545' };
    return { text: 'Critical', color: '#8B0000' };
  };

  if (loading && subjects.length === 0) return <LoadingSpinner />;

  const totalStudents = report?.report?.length || 0;
  const above75 = report?.report?.filter(s => parseFloat(s.percentage) >= 75).length || 0;
  const between60_75 = report?.report?.filter(s => parseFloat(s.percentage) >= 60 && parseFloat(s.percentage) < 75).length || 0;
  const between30_60 = report?.report?.filter(s => parseFloat(s.percentage) >= 30 && parseFloat(s.percentage) < 60).length || 0;
  const below30 = report?.report?.filter(s => parseFloat(s.percentage) < 30).length || 0;
  const avgAttendance = totalStudents > 0 ? (report.report.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / totalStudents).toFixed(2) : 0;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>View Attendance Report</h2>
      
      <div className="filter-bar">
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', width: '100%' }}>
          <div className="filter-group" style={{ flex: 2 }}>
            <label>📚 Select Subject</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required>
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group" style={{ flex: 1 }}>
            <label>📅 Month</label>
            <select name="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group" style={{ flex: 1 }}>
            <label>📆 Year</label>
            <select name="year" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn" style={{ width: 'auto' }}>📊 View Report</button>
          </div>
        </form>
      </div>

      {loading && <LoadingSpinner />}

      {report && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '15px 20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>{selectedSubjectCode} - {selectedSubjectName}</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>👨‍🏫 Teacher: {teacherName}</p>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>📅 {months[filters.month - 1]} {filters.year} | Total Lectures: {report.total_lectures}</p>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card"><h3>📈 Average Attendance</h3><div className="stat-number">{avgAttendance}%</div></div>
            <div className="stat-card"><h3>✅ Above 75%</h3><div className="stat-number" style={{ color: '#28a745' }}>{above75}</div><small>{((above75/totalStudents)*100).toFixed(1)}%</small></div>
            <div className="stat-card"><h3>⚠️ 60-75%</h3><div className="stat-number" style={{ color: '#ff9800' }}>{between60_75}</div><small>{((between60_75/totalStudents)*100).toFixed(1)}%</small></div>
            <div className="stat-card"><h3>🔴 30-60%</h3><div className="stat-number" style={{ color: '#dc3545' }}>{between30_60}</div><small>{((between30_60/totalStudents)*100).toFixed(1)}%</small></div>
            <div className="stat-card" style={{ border: below30 > 0 ? '2px solid #8B0000' : 'none' }}>
              <h3>⚠️ Below 30%</h3><div className="stat-number" style={{ color: '#8B0000', fontSize: '32px' }}>{below30}</div>
              <small style={{ color: '#8B0000' }}>{((below30/totalStudents)*100).toFixed(1)}%</small>
            </div>
            <div className="stat-card"><h3>👨‍🎓 Total Students</h3><div className="stat-number" style={{ color: '#17a2b8' }}>{totalStudents}</div></div>
          </div>
          
          {below30 > 0 && (
            <div style={{ background: '#f8d7da', border: '2px solid #dc3545', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
              <strong style={{ color: '#721c24', fontSize: '16px' }}>⚠️ CRITICAL ALERT!</strong>
              <p style={{ margin: '5px 0 0 0', color: '#721c24' }}>{below30} student(s) have attendance below 30% and are at risk of debarment from examinations.</p>
            </div>
          )}
          
          <div className="table-container">
            <h3>Detailed Attendance Report</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th>Sr. No.</th><th>Roll Number</th><th>Student Name</th><th>Present Days</th><th>Total Lectures</th><th>Attendance %</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.report.map((student, index) => {
                    const percentage = parseFloat(student.percentage);
                    const status = getStatusText(percentage);
                    return (
                      <tr key={index} style={percentage < 30 ? { background: '#f8d7da' } : {}}>
                        <td>{index + 1}</td>
                        <td><strong>{student.roll_number}</strong></td>
                        <td style={{ textAlign: 'left' }}>{student.student_name}</td>
                        <td>{student.total_present}</td>
                        <td>{student.total_days}</td>
                        <td className={getPercentageClass(percentage)}><strong>{student.percentage}%</strong></td>
                        <td style={{ color: status.color, fontWeight: 'bold' }}>{status.text}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {below30 > 0 && (
            <div className="table-container" style={{ marginTop: '20px', background: '#f8d7da' }}>
              <h3 style={{ color: '#721c24' }}>⚠️ Students Below 30% Attendance</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ background: '#dc3545', color: 'white' }}>
                      <th>Sr. No.</th><th>Roll Number</th><th>Student Name</th><th>Present Days</th><th>Total Lectures</th><th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.report.filter(s => parseFloat(s.percentage) < 30).map((student, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td><strong>{student.roll_number}</strong></td>
                        <td>{student.student_name}</td>
                        <td>{student.total_present}</td>
                        <td>{student.total_days}</td>
                        <td style={{ color: '#8B0000', fontWeight: 'bold' }}>{student.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #dee2e6' }}>
            <button onClick={exportToExcel} className="btn" style={{ width: 'auto', background: '#28a745', padding: '12px 30px', fontSize: '16px' }}>📊 Download Excel Report</button>
            <button onClick={exportToCSV} className="btn" style={{ width: 'auto', background: '#17a2b8', padding: '12px 30px', fontSize: '16px' }}>📄 Download CSV Report</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAttendance;