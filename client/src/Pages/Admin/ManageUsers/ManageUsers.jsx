import React, { useState } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const ManageUsers = () => {
  const { data: users,refetch } = useFetchData("users", "/all-users");
  const axiosInstance = AxiosSecure();

  //   adminHandler
  const adminHandler = async (id) => {
    const res = await axiosInstance.patch(`/update/user-role/${id}`, {
      role: "admin",
    });
    if (
      (res?.data?.matchedCount > 0 && res?.data?.modifiedCount > 0) ||
      (res?.data?.matchedCount > 0 && res?.data?.modifiedCount === 0)
    ) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "User Role Updated Successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      refetch()
    }
  };

  //   facultyHandler
  const facultyHandler = async (id) => {
    const res = await axiosInstance.patch(`/update/user-role/${id}`, {
        role: "faculty",
      });
      if (
        (res?.data?.matchedCount > 0 && res?.data?.modifiedCount > 0) ||
        (res?.data?.matchedCount > 0 && res?.data?.modifiedCount === 0)
      ) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "User Role Updated Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        refetch()
      }
  };

  //   studentHandler
  const studentHandler = async (id) => {
    const res = await axiosInstance.patch(`/update/user-role/${id}`, {
        role: "student",
      });
      if (
        (res?.data?.matchedCount > 0 && res?.data?.modifiedCount > 0) ||
        (res?.data?.matchedCount > 0 && res?.data?.modifiedCount === 0)
      ) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "User Role Updated Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        refetch()
      }
  };

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
            text: "User has been deleted.",
            icon: "success",
          });
        }
      }
    });
  };

  return (
    <div>
      <h3 className="text-3xl font-black text-center mt-6">User Management</h3>
      {/* table-container */}
      <div className="mt-12 p-4">
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role Management</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            referrerPolicy="no-referrer"
                            src={user?.photo}
                            alt="Avatar Tailwind CSS Component"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user?.name}</div>
                        <div className="text-sm opacity-50">
                          <div className="badge badge-info text-white">
                            {user?.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user?.email}</td>
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
                          <button onClick={() => facultyHandler(user?._id)}>
                            Faculty
                          </button>
                        </li>
                        <li>
                          <button onClick={() => adminHandler(user?._id)}>
                            Admin
                          </button>
                        </li>
                        <li>
                          <button onClick={() => studentHandler(user?._id)}>
                            Students
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteHandler(user?._id)}
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
    </div>
  );
};

export default ManageUsers;
