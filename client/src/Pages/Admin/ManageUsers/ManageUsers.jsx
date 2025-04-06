import React, { useEffect, useState } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const { data: user, refetch } = useFetchData("users", "/all-users");
  const { user: admin } = useAuth();
  const axiosInstance = AxiosSecure();

  useEffect(() => {
    if (user) {
      const updatedUser = user?.filter((u) => u.email !== admin?.email);
      setUsers(updatedUser);
    }
  }, [user]);

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
      refetch();
    }
  };

  const studentHandler = async (id) => {
    try {
      const user = await axiosInstance.get(`/specific-user/${id}`);
      if (user) {
        const { email, name, photo } = user?.data;
        const studentInfo = {
          email,
          name,
          photo,
        };
        const res = await axiosInstance.post(`/create-student`, studentInfo);
        if (res?.data?.insertedId) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "User Role Updated Successfully",
            showConfirmButton: false,
            timer: 1500,
          });
          refetch()
        }
      }
    } catch (err) {
      console.log(err);
    }
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
    <div className="px-4 md:px-10 py-6 min-h-screen bg-base-200">
      <h3 className="text-3xl font-black text-center mt-6">User Management</h3>
      <div className="mt-12 w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="table table-zebra min-w-[900px]">
            <thead className="bg-base-300">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role Management</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user?._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img
                            referrerPolicy="no-referrer"
                            src={user?.photo}
                            alt="Avatar"
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
                      <div tabIndex={0} role="button" className="btn btn-sm m-1">
                        Click ⬇️
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-32 p-2 shadow-sm"
                      >
                        <li>
                          <button onClick={() => adminHandler(user?._id)}>
                            Admin
                          </button>
                        </li>
                        <li>
                          <button onClick={() => studentHandler(user?._id)}>
                            Student
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteHandler(user?._id)}
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
    </div>
  );
};

export default ManageUsers;