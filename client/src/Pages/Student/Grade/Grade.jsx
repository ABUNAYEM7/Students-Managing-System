import React, { useState } from 'react';
import { FaStar, FaChartLine } from 'react-icons/fa';
import useFetchData from '../../../Components/Hooks/useFetchData';
import useAuth from '../../../Components/Hooks/useAuth';

const Grade = () => {
  const semesterOptions = ['Fall 2024', 'Spring 2025', 'Summer 2025'];
  const [selectedSemester, setSelectedSemester] = useState(semesterOptions[1]);
  const { user } = useAuth();

  // Updated: added semester inside the key
  const { data: dbGrades, refetch } = useFetchData(
    `${user?.email}-${selectedSemester}`,
    `/student-result/${user?.email}?semester=${encodeURIComponent(selectedSemester)}`
  );

  const currentSemesterData = dbGrades?.semester === selectedSemester ? dbGrades : null;
  const grades = currentSemesterData?.grades ?? [];

  const average = grades.length
    ? (grades.reduce((sum, g) => sum + (g?.point ?? 0), 0) / grades.length).toFixed(2)
    : 'N/A';

  const getGradeLetter = (point) => {
    if (point >= 4.5) return 'A+';
    if (point >= 4.0) return 'A';
    if (point >= 3.5) return 'B+';
    if (point >= 3.0) return 'B';
    if (point >= 2.5) return 'C+';
    if (point >= 2.0) return 'C';
    if (point >= 1.5) return 'D';
    return 'F';
  };

  return (
    <div className="p-6 max-w-11/12 mx-auto">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Student Grade Report</h1>
          <select
            className="select select-bordered"
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setTimeout(() => refetch(), 0);
            }}
          >
            {semesterOptions.map((semester, idx) => (
              <option key={idx} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </div>

        <div className="stats shadow mt-6">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <FaChartLine className="text-3xl text-highlight" />
            </div>
            <div className="stat-title">Average Point</div>
            <div className="stat-value text-orange-600">{average}</div>
            <div className="stat-desc">For {selectedSemester}</div>
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Course</th>
                <th>Point</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.length > 0 ? (
                grades.map((item, index) => (
                  <tr key={index}>
                    <td>{item?.courseId}</td>
                    <td>{(item?.point ?? 0).toFixed(2)}</td>
                    <td className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" /> {getGradeLetter(item?.point ?? 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 py-4">
                    No grades available for this semester.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Keep pushing forward! Your progress is tracked and valued.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Grade;
