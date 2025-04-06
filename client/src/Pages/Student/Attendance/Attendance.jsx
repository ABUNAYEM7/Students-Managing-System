import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import useUserRole from '../../../Components/Hooks/useUserRole';
import { useNavigate } from 'react-router';

const Attendance = () => {
  const {data} = useUserRole()
  const navigate  = useNavigate()
  const attendanceData = {
    studentName: 'John Doe',
    totalDays: 30,
    presentDays: 26,
    absentDays: 4,
  };

  const presentPercentage = ((attendanceData.presentDays / attendanceData.totalDays) * 100).toFixed(2);
  const absentPercentage = ((attendanceData.absentDays / attendanceData.totalDays) * 100).toFixed(2);

  const handleApplyLeave = (email) => {
    navigate(`/dashboard/leave-form/${email}`)
  };

  return (
    <div className="p-6 max-w-11/12 mx-auto">
      <div className="bg-white rounded-2xl shadow p-6 space-y-8">
        <h1 className="text-2xl font-bold text-center">Attendance Report</h1>

        <div className="text-center">
          <p className="text-lg font-semibold">Student: {data?.data?.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-prime/60 rounded-xl text-center">
            <FaCheckCircle className="text-green-600 text-3xl mx-auto mb-2" />
            <p className="text-lg font-semibold">Present Days</p>
            <p className="text-xl">{attendanceData.presentDays} Days</p>
            <p className="text-sm text-green-800">{presentPercentage}%</p>
          </div>

          <div className="p-4 bg-orange-600/60 rounded-xl text-center">
            <FaTimesCircle className="text-red-600 text-3xl mx-auto mb-2" />
            <p className="text-lg font-semibold">Absent Days</p>
            <p className="text-xl">{attendanceData.absentDays} Days</p>
            <p className="text-sm text-red-800">{absentPercentage}%</p>
          </div>
        </div>

        {/* state-container */}
        <div className="mt-6 text-center ">
          <div className="stats stats-vertical lg:stats-horizontal shadow">
            <div className="stat">
              <div className="stat-title">Total Days</div>
              <div className="stat-value">{attendanceData.totalDays}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Present %</div>
              <div className="stat-value text-green-600">{presentPercentage}%</div>
            </div>
            <div className="stat">
              <div className="stat-title">Absent %</div>
              <div className="stat-value text-red-600">{absentPercentage}%</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={()=>handleApplyLeave(data?.data?.email)} 
            className="btn bg-highlight text-white w-full"
          >
            Apply for Leave
          </button>
        </div>

      </div>
    </div>
  );
};

export default Attendance;
