import React from "react";
import { FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaUsers } from "react-icons/fa";
import useAuth from "../../../Components/Hooks/useAuth";
import useFetchData from "../../../Components/Hooks/useFetchData";

const AdminDashboardHome = () => {
  const { user } = useAuth();
  const { data: state } = useFetchData("state", "/user-state");
  console.log(state)

  return (
    <div>
      <h3 className="text-2xl font-semibold text-center mt-6">
        Welcome Dear {user?.displayName}
      </h3>

      <div className="mt-12 p-8 grid grid-cols-1 md:grid-cols-2  gap-5 ">
        
        {/* Admin Card */}
        <div className="card bg-blue-500 text-white min-w-[350px] min-h-[200px] shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-xl">Total Admins</h2>
              <FaUserShield size={30} />
            </div>
            <p className="text-2xl font-bold">{state?.totalAdmin}</p>
          </div>
        </div>

        {/* Faculty Card */}
        <div className="card bg-green-500 text-white min-w-[350px] min-h-[200px]  shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-xl">Total Faculties</h2>
              <FaChalkboardTeacher size={30} />
            </div>
            <p className="text-2xl font-bold">{state?.totalFaculty}</p>
          </div>
        </div>

        {/* Student Card */}
        <div className="card bg-yellow-500 text-white min-w-[350px] min-h-[200px]  shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-xl">Total Students</h2>
              <FaUserGraduate size={30} />
            </div>
            <p className="text-2xl font-bold">{state?.totalStudents}</p>
          </div>
        </div>

        {/* User Card */}
        <div className="card bg-red-500 text-white min-w-[350px] min-h-[200px]  shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-xl">Total Users</h2>
              <FaUsers size={30} />
            </div>
            <p className="text-2xl font-bold">{state?.totalUser}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
