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

const AppRouter = () => {
  const {data:user} = useUserRole()
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
            </Route>
          )
        }
        </Route>
    </Routes>
  )
}

export default AppRouter
