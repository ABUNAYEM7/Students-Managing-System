import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import AxiosSecure from "../Hooks/AxiosSecure";
import { FaArrowLeft } from "react-icons/fa";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const ViewUserDetails = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const [user, setUser] = useState(null);
  const [extraDetails, setExtraDetails] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feeInputs, setFeeInputs] = useState({});

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      try {
        const userRes = await axiosInstance.get(`/user-details/${email}`);
        const userData = userRes?.data;
        setUser(userData);

        if (userData?.role === "faculty") {
          const facultyRes = await axiosInstance.get(`/faculty-email/${email}`);
          setExtraDetails(facultyRes?.data);

          const courseRes = await axiosInstance.get(
            `/faculty-assign/courses/${email}`
          );
          setAssignedCourses(courseRes?.data || []);
        } else if (userData?.role === "student") {
          const studentRes = await axiosInstance.get(
            `/student-full-details/${email}`
          );
          const initialFees = {};
          (studentRes?.data?.student?.courses || []).forEach((course, idx) => {
            initialFees[idx] = course?.fee || 0;
          });
          setFeeInputs(initialFees);

          setExtraDetails(studentRes?.data?.student || {});
          setStudentCourses(studentRes?.data?.enrolledCourses || []);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching user details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndDetails();
  }, [email, axiosInstance]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user || !extraDetails) {
    return (
      <div className="text-center mt-10 text-red-500">
        User details not available.
      </div>
    );
  }

  // handle save 
  const handleSaveFee = async (index, course) => {
    try {
      const updatedFee = parseFloat(feeInputs[index]);
  
      if (isNaN(updatedFee) || updatedFee < 0) {
        Swal.fire({
          icon: "error",
          title: "Invalid fee amount",
          text: "Please enter a valid positive number.",
        });
        return;
      }
  
      const response = await axiosInstance.patch(
        `/update-student-course-fee/${extraDetails?._id}`,
        {
          courseId: course.courseId,
          newFee: updatedFee,
        }
      );
  
      if (response?.data?.success) {
        setEditingIndex(null);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Fee updated successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to update fee.",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving fee:", error);
      }
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Server error while saving fee.",
      });
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto p-8 bg-base-100 shadow-xl rounded-3xl border border-gray-300 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {user?.role === "faculty" ? "Faculty" : "Student"} Details
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline flex items-center gap-2"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="avatar">
            <div className="w-48 rounded-full ring ring-highlight ring-offset-base-100 ring-offset-2">
              <img
                src={
                  user?.photo ||
                  extraDetails?.staffPhoto ||
                  "https://i.ibb.co/2K2tkj1/default-avatar.png"
                }
                alt="Avatar"
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.name ||
                `${extraDetails?.firstName || ""} ${
                  extraDetails?.lastName || ""
                }`}
            </h2>
            <p className="text-lg text-gray-500">
              {user?.email || "No email available"}
            </p>
            {extraDetails?.designation && (
              <div className="mt-2 badge badge-info text-white">
                {extraDetails?.designation}
              </div>
            )}
          </div>
        </div>
        {/* basic details container */}
        <div className="grid grid-cols-1 gap-4">
          {user?.role === "faculty" && (
            <>
              <p>
                <strong>Staff No:</strong> {extraDetails?.staffNo || "N/A"}
              </p>
              <p>
                <strong>Role:</strong> {extraDetails?.role || "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {extraDetails?.gender || "N/A"}
              </p>
              <p>
                <strong>DOB:</strong> {extraDetails?.dob || "N/A"}
              </p>
              <p>
                <strong>DOJ:</strong> {extraDetails?.doj || "N/A"}
              </p>
              <p>
                <strong>Mobile:</strong> {extraDetails?.mobile || "N/A"}
              </p>
              <p>
                <strong>Father's Name:</strong>{" "}
                {extraDetails?.fatherName || "N/A"}
              </p>
              <p>
                <strong>Mother's Name:</strong>{" "}
                {extraDetails?.motherName || "N/A"}
              </p>
              <p>
                <strong>Current Address:</strong>{" "}
                {extraDetails?.currentAddress || "N/A"}
              </p>
              <p>
                <strong>Permanent Address:</strong>{" "}
                {extraDetails?.permanentAddress || "N/A"}
              </p>
              <p>
                <strong>Assigned Courses:</strong>{" "}
                {assignedCourses?.length || 0}
              </p>
            </>
          )}

          {user?.role === "student" && (
            <>
              <p>
                <strong>Department:</strong> {extraDetails?.department || "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {extraDetails?.gender || "N/A"}
              </p>
              <p>
                <strong>City:</strong> {extraDetails?.city || "N/A"}
              </p>
              <p>
                <strong>Country:</strong> {extraDetails?.country || "N/A"}
              </p>
              <p>
                <strong>Current Address:</strong>{" "}
                {extraDetails?.currentAddress || "N/A"}
              </p>
              <p>
                <strong>Permanent Address:</strong>{" "}
                {extraDetails?.permanentAddress || "N/A"}
              </p>
              <p>
                <strong>Enrolled Courses:</strong> {studentCourses?.length || 0}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Faculty Assigned Courses */}
      {user?.role === "faculty" && assignedCourses?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">
            Assigned Course Details
          </h3>
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
                {assignedCourses?.map((course, index) => (
                  <tr key={course?._id || index}>
                    <td>{index + 1}</td>
                    <td>{course?.courseId || "N/A"}</td>
                    <td>{course?.name || "N/A"}</td>
                    <td>{course?.credit || "N/A"}</td>
                    <td>{course?.semester || "N/A"}</td>
                    <td>{course?.department || "N/A"}</td>
                    <td>
                      {course?.date
                        ? dayjs(course.date).format("DD MMM YYYY")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Enrolled Courses */}
      {/* Student Enrolled Courses Table */}
      {user?.role === "student" && extraDetails?.courses?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4">
            Enrolled Course Details
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course ID</th>
                  <th>Course Name</th>
                  <th>Credit</th>
                  <th>Semester</th>
                  <th>Enrollment Date</th>
                  <th>Payment Status</th>
                  <th>Assigned Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {extraDetails?.courses?.map((course, index) => (
                  <tr key={course?.courseId || index}>
                    <td>{index + 1}</td>
                    <td>{course?.courseId || "N/A"}</td>
                    <td>{course?.courseName || "N/A"}</td>
                    <td>{course?.credit || "N/A"}</td>
                    <td>{course?.semester || "N/A"}</td>
                    <td>
                      {course?.enrolledAt
                        ? dayjs(course.enrolledAt).format("DD MMM YYYY")
                        : "N/A"}
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {course?.paymentStatus || "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="input input-bordered input-sm w-24"
                        value={feeInputs[index]}
                        disabled={!(editingIndex === index)}
                        onChange={(e) =>
                          setFeeInputs((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        min="0"
                      />
                    </td>
                    <td className="flex gap-2">
                      {editingIndex === index ? (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleSaveFee(index, course)}
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={() => setEditingIndex(index)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
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
