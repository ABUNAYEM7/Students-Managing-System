import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { FaBars , FaChartBar } from "react-icons/fa6";
import useAuth from '../../../Components/Hooks/useAuth';
import Swal from 'sweetalert2';

const StudentDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {user,userLogOut} = useAuth()

  // Toggle function to open/close the drawer
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // logoutHandler
    const logoutHandler = async () => {
      await userLogOut()
        .then((user) => {
          console.log(user);
          if (!user) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Logout Successful",
              showConfirmButton: false,
              timer: 1500,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };

  return (
    <div className="flex min-h-svh">
      {/* Sidebar Drawer */}
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'w-64' : 'w-0'}
          overflow-hidden bg-base-200
        `}
      >
        <div className="p-4 ">
          {/* sidebar-navigator */}
          <ul className="menu w-full text-xl font-semibold space-y-2">
            <li>
              <NavLink 
               className={({ isActive }) =>
                isActive ? 'bg-primary text-white px-2 py-1 rounded' : 'px-2 py-1'
              }
            to={'/dashboard'}
            >Dashboard</NavLink></li>
            <li>
              <NavLink
              to={'/dashboard/attendance'}
               className={({ isActive }) =>
                isActive ? 'bg-primary text-white px-2 py-1 rounded' : 'px-2 py-1'
              }
              >
                Attendance</NavLink>
              </li>
            <li>
              <NavLink
              to={'/dashboard/grades'}
               className={({ isActive }) =>
                isActive ? 'bg-primary text-white px-2 py-1 rounded' : 'px-2 py-1'
              }
              >Grades</NavLink></li>
            <li>
              <NavLink
              to={'/dashboard/fee'}
             className={({ isActive }) =>
              isActive ? 'bg-primary text-white px-2 py-1 rounded' : 'px-2 py-1'
            }
            >Fees</NavLink></li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 flex items-center justify-between px-4">
          <div className="space-x-2 flex items-center">
          <button 
           onClick={toggleDrawer}>
              {isOpen ? <FaBars size={25}/> : <FaChartBar size={25}/>}
            </button>
            <span className="text-xl font-bold">My App</span>
          </div>
          <div className="">
             <div className="dropdown dropdown-bottom ">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-circle avatar"
                        >
                          <div className="w-10 rounded-full">
                            <img
                              referrerPolicy="no-referrer"
                              alt="user-image"
                              src={user?.photoURL}
                            />
                          </div>
                        </div>
                        <ul
                          tabIndex={0}
                          className="menu -right-2  menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-0 w-52 p-2 shadow"
                        >
                          <li>
                            <Link
                             to={'/dashboard/profile'}
                              className="hover:border-highlight hover:text-highlight mt-2"
                            >
                              Profile
                            </Link>
                          </li>
                          <li>
                            <button
                              className="hover:border-highlight  hover:text-highlight mt-2"
                              onClick={logoutHandler}
                            >
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 bg-base-100">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;