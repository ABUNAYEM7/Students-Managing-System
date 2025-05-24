import React, { useEffect, useState } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import dayjs from "dayjs";

const StudentRoutine = () => {
  const { user } = useAuth();
  const axiosSecure = AxiosSecure();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMonth, setFilteredMonth] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const years = [2024, 2025, 2026];
  const months = Array.from({ length: 12 }, (_, i) =>
    dayjs().month(i).format("MMMM")
  );

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      setFilteredMonth(`${selectedMonth} ${selectedYear}`);
    } else {
      setFilteredMonth("");
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchStudentRoutine = async () => {
      if (!user?.email || !filteredMonth) return;
      try {
        setLoading(true);
        const res = await axiosSecure.get(
          `/student/routine/${user.email}?monthYear=${encodeURIComponent(
            filteredMonth
          )}`
        );
        setRoutines(res.data);
      } catch (err) {
        console.error("Failed to fetch student routine:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentRoutine();
  }, [user?.email, filteredMonth]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        📘️ My Weekly Class Routine
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <select
          className="border px-4 py-2 rounded-md shadow"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map((month, i) => (
            <option key={i} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          className="border px-4 py-2 rounded-md shadow"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {years.map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {!filteredMonth ? (
        <p className="text-center text-gray-500">
          Please select a month and year to get the routine.
        </p>
      ) : loading ? (
        <p className="text-center">Loading...</p>
      ) : routines.length === 0 ? (
        <p className="text-center text-gray-500">
          No routine available for your department.
        </p>
      ) : (
        routines.map((routine, i) => (
<div key={i} className="border rounded-lg p-4 mb-6 shadow bg-white">
  <div className="mb-4">
    <h3 className="font-bold text-lg">
      {routine.department} - {routine.semester}
    </h3>
    <p className="text-sm text-green-500">
      Week Start: {dayjs(routine.weekStartDate).format("MMMM D, YYYY")}
    </p>
  </div>

  {/* Responsive wrapper */}
  <div className="w-full overflow-x-auto">
    <table className="table-auto w-full border text-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="border p-2 whitespace-nowrap">Day</th>
          <th className="border p-2 whitespace-nowrap">Course</th>
          <th className="border p-2 whitespace-nowrap">Time</th>
          <th className="border p-2 whitespace-nowrap">Online Link</th>
        </tr>
      </thead>
      <tbody>
        {routine.routines.map((day, idx) => (
          <tr key={idx}>
            <td className="border p-2 whitespace-nowrap">{day.day}</td>
            <td className="border p-2 whitespace-nowrap">{day.course || "N/A"}</td>
            <td className="border p-2 whitespace-nowrap">{day.time}</td>
            <td className="border p-2 whitespace-nowrap">
              {day.status === "completed" ? (
                <span className="text-green-600 font-semibold">Completed</span>
              ) : (
                <a
                  href={day.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Join Class
                </a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
        ))
      )}
    </div>
  );
};

export default StudentRoutine;
