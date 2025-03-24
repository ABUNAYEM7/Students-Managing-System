import React from 'react'
import { Route, Routes } from 'react-router'
import MainLayout from '../MainLayout/MainLayout'
import Home from '../Pages/Home/Home'
import SignIn from '../Pages/Registration/SignIn'
import SignUp from '../Pages/Registration/SignUp'
import useUserRole from '../Components/Hooks/useUserRole'
import AdminDashboard from '../Pages/Admin/AdminDashboard/AdminDashboard'
import AdminDashboardHome from '../Pages/Admin/AdminHome/AdminDashboardHome'
import Courses from '../Pages/Admin/Courses/Courses'
import ManageFaculty from '../Pages/Admin/ManageFaculty/ManageFaculty'
import ManageStudents from '../Pages/Admin/ManageStudents/ManageStudents'
import AddCourses from '../Pages/Admin/AddCourses/AddCourses'
import EditCourse from '../Components/DynamicRoute/EditCourse/EditCourse'
import ManageUsers from '../Pages/Admin/ManageUsers/ManageUsers'
import StudentDashboard from '../Pages/Student/StudentDashboard/StudentDashboard'
import StudentDashboardHome from '../Pages/Student/StudentDashboardHome/StudentDashboardHome'
import Profile from '../Pages/Student/Profile/Profile'

const AppRouter = () => {
  const {data:user} = useUserRole()
  // console.log(user)
  return (
    <Routes>
        <Route path='/' element={<MainLayout/>}>
        <Route index element={<Home/>}/>
        <Route path='/signIn' element={<SignIn/>}/>
        <Route path='/signUp' element={<SignUp/>}/>
        {
          user?.data?.role  === 'admin' && (
            <Route path='/dashboard' element={<AdminDashboard/>}>
              <Route index element={<AdminDashboardHome/>}/>
              <Route path='courses' element={<Courses/>}/>
              <Route path='add-courses' element={<AddCourses/>}/>
              <Route path='manage-students' element={<ManageStudents/>}/>
              <Route path='manage-faculty' element={<ManageFaculty/>}/>
              <Route path='manage-users' element={<ManageUsers/>}/>
            </Route>
          )
        }
        {
          user?.data?.role === 'student' &&(
            <Route path='/dashboard' element={<StudentDashboard/>}>
              <Route index element={<StudentDashboardHome/>}/>
              <Route path='profile' element={<Profile/>}/>
            </Route>
          )
        }
        {/* dynamic-route */}
        <Route path='/edit-course/:id' element={<EditCourse/>}/>
        </Route>
    </Routes>
  )
}

export default AppRouter
