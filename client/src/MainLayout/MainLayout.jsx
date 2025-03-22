import React from 'react'
import { Outlet } from 'react-router'
import Navbar from "../Shared/Navbar"
import Footer from '../Shared/Footer'

const MainLayout = () => {
  return (
    <div className='border-2 border-black'> 
      <div>
        <div>
            <Navbar/>
        </div>
        <div className='min-h-svh'>
            <Outlet/>
        </div>
        <div>
            <Footer/>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
