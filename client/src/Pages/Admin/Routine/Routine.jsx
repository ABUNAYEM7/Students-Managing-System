import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import dayjs from "dayjs";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import Swal from "sweetalert2";

const Routine = () => {
  const [routines, setRoutines] = useState([]);
  const [filteredMonth, setFilteredMonth] = useState("");
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  const year = 2025;
  const monthsOfYear = Array.from({ length: 12 }, (_, i) =>
    dayjs(`${year}-${i + 1}-01`).format("MMMM YYYY")
  );

  // ⬇️ Refetch logic as a function
  const fetchRoutines = () => {
    if (filteredMonth) {
      axiosInstance
        .get(`/all/weekly-routines?monthYear=${filteredMonth}`)
        .then((res) => setRoutines(res.data))
        .catch((err) => console.error("Error loading routines", err));
    } else {
      setRoutines([]);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [filteredMonth]);

  const handleEdit = (routineItem, dayItem, index) => {
    navigate(`/dashboard/edit-routine/${routineItem._id}/${index}`);
  };

  const deleteHandler = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosInstance.delete(`/delete/weekly-routine/${id}`);
          if (res?.data?.deletedCount > 0) {
            Swal.fire("Deleted!", "Routine has been deleted.", "success");
            fetchRoutines(); // ✅ Refetch after delete
          }
        } catch (err) {
          console.error("Delete error:", err);
        }
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-4">📘 Semester Class Routine</h1>

      <div className="flex justify-center mb-6">
        <select
          className="select border-2 border-prime focus:outline-none"
          value={filteredMonth}
          onChange={(e) => setFilteredMonth(e.target.value)}
        >
          <option value="">Select Month</option>
          {monthsOfYear.map((month, idx) => (
            <option key={idx} value={month}>{month}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end items-center mb-4">
        <Link
          to="/dashboard/add-routine"
          className="btn bg-green-500 text-white hover:bg-green-600"
        >
          Add Routine ➕
        </Link>
      </div>

      {routines.length > 0 ? (
        routines.map((routineItem, routineIndex) => (
          <div key={routineIndex} className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                Department: {routineItem.department}
              </h2>
              <button
                className="btn btn-sm bg-highlight text-white"
                onClick={() => deleteHandler(routineItem._id)}
              >
                Delete Entire Routine
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full bg-base-100 rounded-lg shadow-md">
                <thead className="bg-base-200 text-base font-semibold">
                  <tr>
                    <th>#</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Created At</th>
                    <th>Created By</th>
                    <th>Online Link</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {routineItem.routines.map((item, index) => (
                    <tr key={index} className="hover">
                      <td>{index + 1}</td>
                      <td>{item?.day}</td>
                      <td>{item?.time}</td>
                      <td>{dayjs(routineItem.createdAt).format("DD MMM YYYY")}</td>
                      <td>{routineItem.createdBy}</td>
                      <td className="text-blue-600 underline break-all">{item?.onlineLink}</td>
                      <td className="space-x-2">
                        <button
                          className="btn btn-xs bg-prime text-black"
                          onClick={() => handleEdit(routineItem, item, index)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        filteredMonth && (
          <p className="text-center text-gray-500 mt-4">
            No routine found for {filteredMonth}.
          </p>
        )
      )}
    </div>
  );
};

export default Routine;
