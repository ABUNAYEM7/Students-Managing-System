import React from "react";
import useFetchData from "../Hooks/useFetchData";
import useUserRole from "../Hooks/useUserRole";

const StudentsLeaveRequest = () => {
  const { data } = useUserRole();
  const { data: leaveReq } = useFetchData(
    `${data?.data?.email}`,
    `/student-leave/request/${data?.data?.email}`
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">My Leave Requests</h2>

      {!Array.isArray(leaveReq) || leaveReq.length === 0 ? (
        <p className="text-center text-gray-500">No leave requests submitted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leaveReq.map((leave, index) => {
            const statusColor =
              leave.status === "approved"
                ? "border-l-4 border-prime bg-prime/10 text-green-800"
                : leave.status === "declined"
                ? "border-l-4 border-highlight bg-highlight/10 text-red-700"
                : "border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700";

            return (
              <div
                key={index}
                className={`rounded-xl shadow p-4 space-y-2 ${statusColor}`}
              >
                <p><strong>Leave Type:</strong> {leave.leaveType}</p>
                <p><strong>Reason:</strong> {leave.reason || "N/A"}</p>
                <p><strong>Start Date:</strong> {leave.startDate}</p>
                <p><strong>End Date:</strong> {leave.endDate}</p>
                <p><strong>Application Date:</strong> {leave.applicationDate?.split("T")[0]}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="capitalize font-semibold">
                    {leave.status || "pending"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentsLeaveRequest;
