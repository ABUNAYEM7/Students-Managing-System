import React from "react";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useFetchData from "../../../Components/Hooks/useFetchData";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const ManageStudents = () => {
  const axiosInstance = AxiosSecure();
  const { data: students, refetch } = useFetchData("students", "/all-students");
  const navigate = useNavigate();

  const deleteHandler = (student) => {
    const id = student?._id;
    const email = student?.email;

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
          // Step 1: Update user role to "user"
          const updateRes = await axiosInstance.patch(
            `/update/user-info/${email}`,
            {
              role: "user",
            }
          );

          if (
            updateRes?.data?.modifiedCount > 0 ||
            updateRes?.data?.matchedCount > 0
          ) {
            // Step 2: Delete student
            const deleteRes = await axiosInstance.delete(
              `/delete-student/${id}`
            );

            if (deleteRes?.data?.deletedCount > 0) {
              refetch();
              Swal.fire({
                title: "Deleted!",
                text: "Student has been deleted and role reset to user.",
                icon: "success",
              });
            } else {
              Swal.fire({
                title: "Failed!",
                text: "Role updated but student deletion failed.",
                icon: "error",
              });
            }
          } else {
            Swal.fire({
              title: "Failed!",
              text: "Failed to update user role.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("❌ Error during deletion process:", error);
          Swal.fire({
            title: "Error",
            text: "Something went wrong during the deletion process.",
            icon: "error",
          });
        }
      }
    });
  };

  const viewDetails = (email) => {
    navigate(`/dashboard/view-details/${email}`);
  };

  return (
    <div className="px-4 md:px-10 py-6 min-h-screen bg-base-200">
      <h3 className="text-xl md:text-3xl font-black text-center mb-6">
        Students Management
      </h3>

      {students?.length === 0 ? (
        <h3 className="text-lg md:text-xl font-semibold text-center text-red-600">
          No Students Available
        </h3>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="table table-zebra min-w-[700px]">
              <thead className="bg-base-300">
                <tr>
                  <th className="text-sm">Name</th>
                  <th className="text-sm">Email</th>
                  <th className="text-sm">View Details</th>
                  <th className="text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            <img
                              referrerPolicy="no-referrer"
                              src={student.photo}
                              alt={student.name}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{student.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="text-sm">{student.email}</td>

                    <td>
                      <button
                        onClick={() => viewDetails(student?.email)}
                        className="btn btn-sm bg-prime text-white"
                      >
                        View Details
                      </button>
                    </td>

                    <td>
                      <button
                        onClick={() => deleteHandler(student)}
                        className="btn btn-sm btn-error text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
