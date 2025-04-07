import React from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { useNavigate } from "react-router";

const Courses = () => {
  const { data: courses, refetch } = useFetchData(
    "Courses",
    "/all-courses-by-department"
  );
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

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
        const res = await axiosInstance.delete(`/delete-course/${id}`);
        if (res?.data?.deletedCount > 0) {
          refetch();
          Swal.fire({
            title: "Deleted!",
            text: "Course has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  // updateHandler
  const updateHandler = (id) => {
    navigate(`/edit-course/${id}`);
  };

  return (
    <div>
      <h3 className="text-3xl font-black text-center mt-6">
        Course Management
      </h3>
      <div className="mt-6 p-2 max-w-full md:max-w-[90%] lg:max-w-full  mx-auto">
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>No</th>
                <th>Course ID</th>
                <th>Name </th>
                <th>Credit</th>
                <th>Description</th>
                <th>Create At</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {courses?.map((c, i) => (
                <tr key={c?._id} className="bg-base-200">
                  <th>{i + 1}</th>
                  <td>{c?.courseId}</td>
                  <td>{c?.name}</td>
                  <td>{c?.credit}</td>
                  <td>{c?.description}</td>
                  <td>{c?.date?.split("T")[0]}</td>
                  <td>
                    <div className="dropdown dropdown-start">
                      <div tabIndex={0} role="button" className="btn m-1">
                        Click ⬇️
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm"
                      >
                        <li>
                          <button onClick={() => updateHandler(c?._id)}>
                            Update
                          </button>
                        </li>
                        <li>
                          <button onClick={() => deleteHandler(c?._id)}>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Courses;
