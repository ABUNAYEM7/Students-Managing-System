import React, { useEffect } from "react";
import logo from "../assets/logo.jfif";
import { Link, NavLink } from "react-router";
import useAuth from "../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import useUserRole from "../Components/Hooks/useUserRole";

const Navbar = () => {
  // navigation links
  const Links = (
    <>
      <li>
        <NavLink to={"/"}>Home</NavLink>
      </li>
      <li>
        <NavLink to={"/"}>About</NavLink>
      </li>
      <li>
        <NavLink to={"/"}>Products</NavLink>
      </li>
    </>
  );

  const { user, userLogOut } = useAuth();
  const { data: userRole,refetch } = useUserRole();


  // useEffect to fetch the userRole immediately
  useEffect(()=>{
    if(user && user?.email){
      refetch()
    }
  },[user])

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
    <div className="navbar bg-prime/60 backdrop-blur-md shadow-sm fixed top-0 z-50 mx-auto max-w-[1480px]">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          {/* sm-navigation-links */}
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2  text-highlight"
          >
            {Links}
          </ul>
        </div>
        <Link to={"/"}>
          <img className="w-16 h-16 rounded-full" src={logo} alt="logo" />
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        {/* lg-navigation-links */}
        <ul className="menu menu-horizontal px-1 text-xl font-medium text-highlight">
          {Links}
        </ul>
      </div>
      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-bottom ">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  referrerPolicy="no-referrer"
                  alt="Tailwind CSS Navbar component"
                  src={user?.photoURL}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu right-4 menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-0 w-52 p-2 shadow"
            >
              <li>
                {userRole?.data?.role !== "user" && (
                  <Link
                    to={"/dashboard"}
                    className="hover:border-highlight border-2 hover:text-highlight"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  className="hover:border-highlight border-2 hover:text-highlight mt-2"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <NavLink
            to={"/signIn"}
            className="btn bg-highlight text-white hover:bg-white hover:border-2 hover:border-highlight hover:text-highlight"
          >
            SingIn
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Navbar;
