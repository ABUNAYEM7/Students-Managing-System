import React from 'react'
import AxiosSecure from '../../../Components/Hooks/AxiosSecure';
import useFetchData from '../../../Components/Hooks/useFetchData';
import Swal from 'sweetalert2';

const ManageStudents = () => {
  const axiosInstance = AxiosSecure()
  const { data: students,refetch } = useFetchData(
    "userRole",
    "/all-users?role=student"
  );

  // deleteHandler
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
        const res = await axiosInstance.delete(`/delete-user/${id}`);
        if (res?.data?.deletedCount > 0) {
          refetch();
          Swal.fire({
            title: "Deleted!",
            text: "Student has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  return (
    <div>
      <h3 className="text-3xl font-black text-center mt-6">
        {" "}
        Students Management
      </h3>
      {
        students?.length === 0 ? (
          <h3 className="text-3xl font-black text-center text-red-700 mt-6">
        {" "}
        No Faculty Available
      </h3>
        ):(
          <div className="mt-12 p-4">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <tr key={student?._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              referrerPolicy="no-referrer"
                              src={student?.photo}
                              alt="Avatar Tailwind CSS Component"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{student?.name}</div>
                          <div className="text-sm opacity-50">
                            <div className="badge badge-info text-white">
                              {student?.role}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{student?.email}</td>
                    <td>
                      <button
                        onClick={() => deleteHandler(student?._id)}
                        className="btn btn-error text-white"
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
        )
      }
    </div>
  )
}

export default ManageStudents
