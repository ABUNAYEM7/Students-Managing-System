import React, { useEffect, useState } from "react";
import AxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";

const FacultyLeaveRequests = ({ facultyEmail, courseId }) => {
  const [leaves, setLeaves] = useState([]);
  const axiosInstance = AxiosSecure();

  useEffect(() => {
    const fetchLeaves = async () => {
      if (facultyEmail && courseId) {
        try {
          const res = await axiosInstance.get(
            `/faculty-leaves?facultyEmail=${facultyEmail}&courseId=${courseId}`
          );
          setLeaves(res.data || []);
        } catch (error) {
          console.error("Error fetching leave applications", error);
        }
      } else {
        setLeaves([]);
      }
    };

    fetchLeaves();
  }, [facultyEmail, courseId, axiosInstance]);

  const handleAction = async (id, status) => {
    try {
      const res = await axiosInstance.patch(`/update-leave-status/${id}`, {
        status,
      });

      if (res.data.modifiedCount > 0) {
        Swal.fire("Success", `Leave ${status}`, "success");
        setLeaves((prev) =>
          prev.map((leave) =>
            leave._id === id ? { ...leave, status } : leave
          )
        );
      }
    } catch (err) {
      console.error("Failed to update leave status", err);
      Swal.fire("Error", "Unable to update leave status", "error");
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Leave Applications</h2>

      {leaves.length === 0 ? (
        <p className="text-gray-500">No leave applications found for this course.</p>
      ) : (
        <ul className="space-y-4">
          {leaves.map((leave, idx) => {
            const isApproved = leave.status === "approved";
            const isDeclined = leave.status === "declined";

            // 🔷 Set card background and text based on status
            const cardClass = isApproved
              ? "bg-blue-100 text-blue-800"
              : isDeclined
              ? "bg-red-100 text-red-800"
              : "bg-white text-black";

            return (
              <li
                key={idx}
                className={`p-4 border rounded-lg shadow-sm text-sm space-y-2 ${cardClass}`}
              >
                <p><strong>Email:</strong> {leave.email}</p>
                <p><strong>Reason:</strong> {leave.reason || "Not specified"}</p>
                <p><strong>Application Date:</strong> {leave.applicationDate.split('T')[0]}</p>
                <p><strong>Start Date:</strong> {leave.startDate}</p>
                <p><strong>End Date:</strong> {leave.endDate}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      isApproved
                        ? "text-green-600"
                        : isDeclined
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {leave.status || "Pending"}
                  </span>
                </p>

                {(leave.status === "pending" || !leave.status) && (
                  <div className="flex gap-3">
                    <button
                      className="btn btn-sm bg-prime text-black"
                      onClick={() => handleAction(leave._id, "approved")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-sm bg-highlight text-white"
                      onClick={() => handleAction(leave._id, "declined")}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FacultyLeaveRequests;
