import React from 'react'
import { Link } from 'react-router'

const Materials = () => {
  return (
    <div>
      <div className='mt-3 p-4 flex items-center justify-between'>
        <h3 className='text-2xl font-medium'>Material Management</h3>
        <Link
          to={"/dashboard/add-materials"}
          className="btn uppercase hover:bg-green-400 hover:text-white"
        >
          Add Material ➕
        </Link>
      </div>
    </div>
  )
}

export default Materials
