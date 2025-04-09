import React, { useEffect, useState } from "react";
import socket from "../Hooks/useSocket";

const LeaveRequestsLive = () => {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    socket.on("new-leave-request", (newLeave) => {
      console.log("📩 New leave received:", newLeave);
      setLeaves((prev) => [newLeave, ...prev]);
    });

    return () => {
        socket.off("new-leave-request");
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Leave Requests</h2>
      {leaves.length === 0 && <p>No new leave requests yet.</p>}
      <ul>
        {leaves.map((leave, index) => (
          <li key={index} className="mb-2 border p-2 rounded">
            <strong>{leave.name || leave.email}</strong> requested leave on{" "}
            <span>{leave.applicationDate}</span>
            <br />
            Reason: {leave.reason}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaveRequestsLive;
