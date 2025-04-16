import React, { useState, useMemo, useEffect } from "react";
import useAuth from "../../../Components/Hooks/useAuth";
import dayjs from "dayjs";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const FacultyRoutine = () => {
  const { user } = useAuth();
  const email = user?.email;
  const axiosInstance = AxiosSecure();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredMonth, setFilteredMonth] = useState("");

  const monthsOfYear = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) =>
      dayjs(`${year}-${i + 1}-01`).format("MMMM YYYY")
    );
  }, []);

  const fetchRoutines = async () => {
    if (!email || !filteredMonth) return;

    setLoading(true);
    try {
      const url = `/get-weekly/routine/${email}?monthYear=${encodeURIComponent(
        filteredMonth
      )}`;
      const res = await axiosInstance.get(url);
      setRoutines(res.data);
    } catch (err) {
      console.error("Failed to fetch routines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [email, filteredMonth]);

  const handleComplete = async (routineId, dayIndex) => {
    try {
      const res = await axiosInstance.patch(
        `/update-routine-day-status/${routineId}/${dayIndex}`,
        { status: "completed" }
      );

      if (res.data?.modifiedCount > 0) {
        fetchRoutines(); // ✅ refresh after marking complete
      }
    } catch (error) {
      console.error("Error marking routine complete:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-center mb-6">Faculty Weekly Routine</h2>

      {/* Month Filter Dropdown */}
      <div className="flex justify-center mb-6">
        <select
          className="border px-4 py-2 rounded-md shadow"
          value={filteredMonth}
          onChange={(e) => setFilteredMonth(e.target.value)}
        >
          <option value="">Please select a month</option>
          {monthsOfYear.map((month, i) => (
            <option key={i} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Conditional Content */}
      {!filteredMonth ? (
        <p className="text-center text-gray-500">Please select a month to get the routine.</p>
      ) : loading ? (
        <p className="text-center">Loading...</p>
      ) : routines.length === 0 ? (
        <p className="text-center text-gray-500">No routines found for this month.</p>
      ) : (
        <div className="overflow-x-auto">
          {routines.map((routine, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 mb-6 shadow bg-white"
            >
              <div className="mb-4">
                <h3 className="font-bold text-lg">
                  {routine.department} - {routine.semester}
                </h3>
                <p className="text-sm text-gray-500">
                  Week Start: {dayjs(routine.weekStartDate).format("MMMM D, YYYY")}
                </p>
              </div>

              <table className="min-w-full table-auto border">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border p-2">Day</th>
                    <th className="border p-2">Time</th>
                    <th className="border p-2">Online Link</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {routine.routines.map((dayRoutine, idx) =>
                    dayRoutine.facultyEmails?.includes(email) ? (
                      <tr key={idx}>
                        <td className="border p-2">{dayRoutine.day}</td>
                        <td className="border p-2">{dayRoutine.time}</td>
                        <td className="border p-2">
                          <a
                            href={dayRoutine.onlineLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Join Class
                          </a>
                        </td>
                        <td className="border p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dayRoutine.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {dayRoutine.status || "pending"}
                          </span>
                        </td>
                        <td className="border p-2">
                          {dayRoutine.status !== "completed" && (
                            <button
                              className="btn btn-xs bg-prime text-black hover:bg-highlight hover:text-white"
                              onClick={() => handleComplete(routine._id, idx)}
                            >
                              Mark as Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyRoutine;
