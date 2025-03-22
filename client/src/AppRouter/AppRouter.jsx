import React from 'react'
import { Route, Routes } from 'react-router'
import MainLayout from '../MainLayout/MainLayout'
import Home from '../Pages/Home/Home'
import SignIn from '../Pages/Registration/SignIn'
import SignUp from '../Pages/Registration/SignUp'

const AppRouter = () => {
  return (
    <Routes>
        <Route path='/' element={<MainLayout/>}>
        <Route index element={<Home/>}/>
        <Route path='/signIn' element={<SignIn/>}/>
        <Route path='/signUp' element={<SignUp/>}/>
        </Route>
    </Routes>
  )
}

export default AppRouter
