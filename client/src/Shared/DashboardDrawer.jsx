import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { FaBars, FaChartBar, FaHome, FaBook, FaUserGraduate, FaUsers, FaUserTie, FaClipboardList, FaMoneyBill } from "react-icons/fa";
import Swal from "sweetalert2";
import useAuth from "../Components/Hooks/useAuth";
import useUserRole from "../Components/Hooks/useUserRole";
import logo from "../assets/logo.jfif";

const navIcons = {
  "ADMIN Dashboard": <FaHome />, 
  Courses: <FaBook />, 
  "Add Courses": <FaClipboardList />, 
  Students: <FaUserGraduate />, 
  Faculty: <FaUserTie />, 
  "Manage Users": <FaUsers />, 
  Dashboard: <FaHome />, 
  Grades: <FaClipboardList />, 
  Attendance: <FaClipboardList />, 
  Assignment: <FaClipboardList />, 
  Materials: <FaBook />, 
  Assignments: <FaClipboardList />, 
  Fees: <FaMoneyBill />,
};

const getNavClass = ({ isActive }) =>
  isActive
    ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary rounded-md px-3 py-2"
    : "text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2";

const ResponsiveNavLink = ({ to, label, icon, end = false }) => (
  <NavLink to={to} className={getNavClass} end={end}>
    <div className="flex sm:flex-col items-center sm:items-start gap-2">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  </NavLink>
);

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="navbar bg-base-300 flex items-center justify-between px-4">
        <div className="space-x-2 flex items-center">
          <button onClick={toggleDrawer}>
            {isOpen ? <FaBars size={25} /> : <FaChartBar size={25} />}
          </button>
          <Link to={'/'}>
            <img className="w-12 h-12 rounded-full" src={logo} alt="logo" />
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

      <div className="flex flex-col sm:flex-row flex-1">
        {/* Sidebar Drawer */}
        <div
          className={`transition-all duration-300 ${isOpen ? "h-auto sm:w-64" : "h-0 sm:w-0"} overflow-hidden bg-base-200 sm:h-auto sm:block`}
        >
          <div className="p-4">
            <ul className="menu w-full text-lg font-semibold space-y-2">
              {/* admin navigation buttons */}
              {userRole === "admin" && (
                <>
                  <li>
                    <ResponsiveNavLink to="/dashboard/admin/home" label="ADMIN Dashboard" icon={navIcons["ADMIN Dashboard"]} end />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/courses" label="Courses" icon={navIcons["Courses"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/add-courses" label="Add Courses" icon={navIcons["Add Courses"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/manage-students" label="Students" icon={navIcons["Students"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/manage-faculty" label="Faculty" icon={navIcons["Faculty"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/manage-users" label="Manage Users" icon={navIcons["Manage Users"]} />
                  </li>
                </>
              )}
              {/* faculty navigation buttons */}
              {userRole === "faculty" && (
                <>
                  <li>
                    <ResponsiveNavLink to="/dashboard/faculty/home" label="Dashboard" icon={navIcons["Dashboard"]} end />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/faculty-courses" label="Courses" icon={navIcons["Courses"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/faculty-grades" label="Grades" icon={navIcons["Grades"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/faculty-attendance" label="Attendance" icon={navIcons["Attendance"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/assignment" label="Assignment" icon={navIcons["Assignment"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/materials" label="Materials" icon={navIcons["Materials"]} />
                  </li>
                </>
              )}
              {/* student navigation buttons */}
              {userRole === "student" && (
                <>
                  <li>
                    <ResponsiveNavLink to="/dashboard/student/home" label="Dashboard" icon={navIcons["Dashboard"]} end />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/student-courses" label="Courses" icon={navIcons["Courses"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/student-assignment" label="Assignments" icon={navIcons["Assignments"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/attendance" label="Attendance" icon={navIcons["Attendance"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/grade" label="Grades" icon={navIcons["Grades"]} />
                  </li>
                  <li>
                    <ResponsiveNavLink to="/dashboard/fee" label="Fees" icon={navIcons["Fees"]} />
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-2 flex-1 bg-base-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardDrawer;
