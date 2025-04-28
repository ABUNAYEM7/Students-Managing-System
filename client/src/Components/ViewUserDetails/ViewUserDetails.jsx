import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import AxiosSecure from '../Hooks/AxiosSecure';
import { FaArrowLeft } from 'react-icons/fa';
import dayjs from 'dayjs'; // for date formatting

const ViewUserDetails = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const [user, setUser] = useState(null);
  const [extraDetails, setExtraDetails] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]); // 🆕 Now saving full courses array

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      try {
        const userRes = await axiosInstance.get(`/user-details/${email}`);
        const userData = userRes.data;
        setUser(userData);

        if (userData.role === 'faculty') {
          const facultyRes = await axiosInstance.get(`/faculty-email/${email}`);
          setExtraDetails(facultyRes.data);

          const courseRes = await axiosInstance.get(`/faculty-assign/courses/${email}`);
          setAssignedCourses(courseRes.data); // Save all assigned courses
        } else if (userData.role === 'student') {
          const studentRes = await axiosInstance.get(`/student/${email}`);
          setExtraDetails(studentRes.data);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      }
    };

    fetchUserAndDetails();
  }, [email, axiosInstance]);

  if (!user || !extraDetails) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-base-100 shadow-xl rounded-3xl border border-gray-300 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{user.role === 'faculty' ? 'Faculty' : 'Student'} Details</h2>
        <button onClick={() => navigate(-1)} className="btn btn-outline flex items-center gap-2">
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="avatar">
            <div className="w-48 rounded-full ring ring-highlight ring-offset-base-100 ring-offset-2">
              <img src={user?.photo || extraDetails?.staffPhoto} alt="Avatar" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.name || `${extraDetails?.firstName} ${extraDetails?.lastName}`}
            </h2>
            <p className="text-lg text-gray-500">{user?.email}</p>
            {extraDetails?.designation && (
              <div className="mt-2 badge badge-info text-white">{extraDetails.designation}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {user?.role === 'faculty' && (
            <>
              <p><strong>Staff No:</strong> {extraDetails?.staffNo}</p>
              <p><strong>Role:</strong> {extraDetails?.role}</p>
              <p><strong>Gender:</strong> {extraDetails?.gender}</p>
              <p><strong>DOB:</strong> {extraDetails?.dob}</p>
              <p><strong>DOJ:</strong> {extraDetails?.doj}</p>
              <p><strong>Mobile:</strong> {extraDetails?.mobile}</p>
              <p><strong>Father's Name:</strong> {extraDetails?.fatherName}</p>
              <p><strong>Mother's Name:</strong> {extraDetails?.motherName}</p>
              <p><strong>Current Address:</strong> {extraDetails?.currentAddress}</p>
              <p><strong>Permanent Address:</strong> {extraDetails?.permanentAddress}</p>
              {/* Assigned courses */}
              <p><strong>Assigned Courses:</strong> {assignedCourses.length}</p>
            </>
          )}

          {user?.role === 'student' && (
            <>
              <p><strong>Department:</strong> {extraDetails?.department}</p>
              <p><strong>Gender:</strong> {extraDetails?.gender}</p>
              <p><strong>City:</strong> {extraDetails?.city}</p>
              <p><strong>Country:</strong> {extraDetails?.country}</p>
              <p><strong>Current Address:</strong> {extraDetails?.currentAddress}</p>
              <p><strong>Permanent Address:</strong> {extraDetails?.permanentAddress}</p>
              {extraDetails?.courses && (
                <p><strong>Enrolled Courses:</strong> {extraDetails.courses.length}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🆕 Show Courses Table if Faculty */}
      {user?.role === 'faculty' && assignedCourses.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">Assigned Course Details</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Credit</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {assignedCourses.map((course, index) => (
                  <tr key={course._id}>
                    <td>{index + 1}</td>
                    <td>{course.courseId}</td>
                    <td>{course.name}</td>
                    <td>{course.credit}</td>
                    <td>{course.semester}</td>
                    <td>{course.department}</td>
                    <td>{dayjs(course.date).format('DD MMM YYYY')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUserDetails;
