import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { FaBars, FaChartBar } from "react-icons/fa6";
import Swal from "sweetalert2";
import useAuth from "../Components/Hooks/useAuth";
import useUserRole from "../Components/Hooks/useUserRole";
import logo from "../assets/logo.jfif"

const DashboardDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userLogOut } = useAuth();
  const { data } = useUserRole();
  const userRole = data?.data?.role;

  const toggleDrawer = () => setIsOpen(!isOpen);

  const logoutHandler = async () => {
    try {
      await userLogOut();
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Logout Successful",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Reusable NavLink style helper
  const getNavClass = ({ isActive }) =>
    isActive
      ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary rounded-md px-3 py-2"
      : "text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Drawer */}
      <div
        className={`
          transition-all duration-300
          ${isOpen ? "w-64" : "w-0"}
          overflow-hidden bg-base-200
        `}
      >
        <div className="p-4">
          <ul className="menu w-full text-lg font-semibold space-y-2">
            {/* admin navigation buttons */}
            {userRole === "admin" && (
              <>
                <li>
                  <NavLink to="/dashboard/admin/home" className={getNavClass} end>
                    ADMIN Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/courses" className={getNavClass}>
                    Courses
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/add-courses" className={getNavClass}>
                    Add Courses
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/manage-students" className={getNavClass}>
                    Students
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/manage-faculty" className={getNavClass}>
                    Faculty
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/manage-users" className={getNavClass}>
                    Manage Users
                  </NavLink>
                </li>
              </>
            )}
            {/* faculty navigation buttons */}
            {userRole === "faculty" && (
              <>
                <li>
                  <NavLink to="/dashboard/faculty/home" className={getNavClass} end>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/faculty-courses" className={getNavClass}>
                    Courses
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/faculty-grades" className={getNavClass}>
                    Grades
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/faculty-attendance" className={getNavClass}>
                    Attendance
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/assignment" className={getNavClass}>
                     Assignment
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/materials" className={getNavClass}>
                    Materials
                  </NavLink>
                </li>
              </>
            )}
            {/* student navigation buttons */}
            {userRole === "student" && (
              <>
                <li>
                  <NavLink to="/dashboard/student/home" className={getNavClass} end>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/attendance" className={getNavClass}>
                    Attendance
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/grade" className={getNavClass}>
                    Grades
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/fee" className={getNavClass}>
                    Fees
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 flex items-center justify-between px-4">
          <div className="space-x-2 flex items-center">
            <button onClick={toggleDrawer}>
              {isOpen ? <FaBars size={25} /> : <FaChartBar size={25} />}
            </button>
            <Link 
            to={'/'}>
            <img 
            className="w-12 h-12 rounded-full"
            src={logo} alt="logo" />
            </Link>
          </div>
          <div>
            <div className="dropdown dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    referrerPolicy="no-referrer"
                    alt="user"
                    src={user?.photoURL || "/default-avatar.png"}
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content right-0 bg-base-100 rounded-box shadow mt-2 w-52 p-2 z-50"
              >
                <li>
                  <Link to="/dashboard/profile" className="hover:text-primary">
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={logoutHandler} className="hover:text-primary">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 flex-1 bg-base-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardDrawer;
