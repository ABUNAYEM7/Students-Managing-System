import React from "react";
import { Route, Routes } from "react-router";
import MainLayout from "../MainLayout/MainLayout";
import Home from "../Pages/Home/Home";
import SignIn from "../Pages/Registration/SignIn";
import SignUp from "../Pages/Registration/SignUp";
import AdminDashboardHome from "../Pages/Admin/AdminHome/AdminDashboardHome";
import Courses from "../Pages/Admin/Courses/Courses";
import ManageFaculty from "../Pages/Admin/ManageFaculty/ManageFaculty";
import ManageStudents from "../Pages/Admin/ManageStudents/ManageStudents";
import AddCourses from "../Pages/Admin/AddCourses/AddCourses";
import EditCourse from "../Components/DynamicRoute/EditCourse/EditCourse";
import ManageUsers from "../Pages/Admin/ManageUsers/ManageUsers";
import Profile from "../Pages/Student/Profile/Profile";
import PrivateRoute from "../Pages/PrivateRoute/PrivateRoute";
import Dashboard from "../Pages/DashBoard/Dashboard";
import { Navigate } from "react-router";
import Attendance from "../Pages/Student/Attendance/Attendance";
import Grade from "../Pages/Student/Grade/Grade";
import Fee from "../Pages/Student/Fee/Fee";
import FacultyDashboard from "../Pages/Faculty/FacultyDashboard/FacultyDashboard";
import StudentsDashboardHome from "../Pages/Student/StudentDashboardHome/StudentDashboardHome"
import FacultyCourses from "../Pages/Faculty/FacultyCourses/FacultyCourses"
import FacultyGrades from "../Pages/Faculty/FacultyGrades/FacultyGrades"
import FacultyAttendance from "../Pages/Faculty/FacultyAttendance/FacultyAttendance"
import CreateAssignment from "../Pages/Faculty/createAssignment/CreateAssignment"
import Materials from "../Pages/Faculty/Materials/Materials"
import AddFaculty from "../Pages/Admin/ManageFaculty/AddFaculty";
import AddMaterials from "../Pages/Faculty/AddMaterials/AddMaterials";
import Assignment from "../Pages/Faculty/Assignment/Assignment";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="signIn" element={<SignIn />} />
        <Route path="signUp" element={<SignUp />} />
        <Route path="edit-course/:id" element={<EditCourse />} />

        {/* Protected Dashboard Route for Admin & Student */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Redirect based on role */}
          <Route index element={<Navigate to="home" replace />} />

          {/* Admin Routes */}
          <Route path="admin/home" element={<AdminDashboardHome />} />
          <Route path="courses" element={<Courses />} />
          <Route path="add-courses" element={<AddCourses />} />
          <Route path="manage-students" element={<ManageStudents />} />
          <Route path="manage-faculty" element={<ManageFaculty />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="/dashboard/add-faculty" element={<AddFaculty />} />

          {/* Student Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="student/home" element={<StudentsDashboardHome/>} />
          <Route path="attendance" element={<Attendance/>}/>
          <Route path="grade" element={<Grade/>}/>
          <Route path="Fee" element={<Fee/>}/>

          {/* Faculty Routes */}
          <Route>
            <Route path="faculty/home" element={<FacultyDashboard/>}/>
            <Route path="faculty-courses" element={<FacultyCourses/>}/>
            <Route path="faculty-grades" element={<FacultyGrades/>}/>
            <Route path="faculty-attendance" element={<FacultyAttendance/>}/>
            <Route path="assignment" element={<Assignment/>}/>
            <Route path="add-assignment" element={<CreateAssignment/>}/>
            <Route path="add-assignment/:id" element={<CreateAssignment/>}/>
            <Route path="materials" element={<Materials/>}/>
            <Route path="add-materials" element={<AddMaterials/>}/>
            <Route path="add-materials/:id" element={<AddMaterials/>}/>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
