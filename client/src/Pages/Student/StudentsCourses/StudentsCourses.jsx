import React, { useState } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import { FaBookOpen, FaChalkboardTeacher, FaClock } from "react-icons/fa";
import { MdOutlineCalendarToday } from "react-icons/md";
import Swal from "sweetalert2";
import useAuth from "../../../Components/Hooks/useAuth";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const StudentsCourses = () => {
  const [selectedDept, setSelectedDept] = useState("");
  const { user } = useAuth();
  const axiosSecure = AxiosSecure();

  const { data: student, refetch: refetchStudent } = useFetchData(
    `${user?.email}`,
    `/student/${user?.email}`
  );

  const {
    data: courses = [],
    loading,
    refetch,
  } = useFetchData(
    `courses-${selectedDept}`,
    `/all-courses-by-department?department=${selectedDept}`
  );

  const enrolledCourseIds = student?.courses?.map((c) => c.courseId) || [];

  const handleEnroll = async (course) => {
    try {
      const res = await axiosSecure.post("/enroll-course", {
        email: user?.email,
        course: {
          courseId: course._id,
          courseName: course.name,
          credit: course.credit,
          semester: course.semester,
          enrolledAt: new Date().toISOString(),
        },
      });

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Enrolled!",
          text: `You have successfully enrolled in ${course.name}`,
          timer: 1500,
          showConfirmButton: false,
        });
        refetch();
        refetchStudent();
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      Swal.fire({
        icon: "error",
        title: "Enrollment Failed",
        text: "Could not enroll in the course. Please try again.",
      });
    }
  };

  const renderCourseCard = (course, isEnrolled) => (
    <div
      key={course._id}
      className="card bg-white shadow-md hover:shadow-xl transition duration-300 border-t-4 border-primary"
    >
      <div className="card-body">
        <h2 className="card-title text-xl text-highlight">
          <FaBookOpen /> {course.name}
        </h2>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <FaChalkboardTeacher /> Instructor: {course.facultyName || "TBD"}
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <FaClock /> Credit Hours: {course.credit}
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          🎓 Semester: {course.semester || "Not specified"}
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <MdOutlineCalendarToday /> Start Date: {course.date || "N/A"}
        </p>
        <p className="text-gray-600 mt-2 text-sm">
          {course.description?.slice(0, 100) || "No description available."}
        </p>

        <div className="card-actions justify-end mt-4">
          <button
            disabled={isEnrolled}
            onClick={() => handleEnroll(course)}
            className={`btn btn-sm ${
              isEnrolled ? "btn-disabled bg-gray-400" : "bg-primary text-white"
            }`}
          >
            {isEnrolled ? "Enrolled" : "Enroll"}
          </button>
        </div>
      </div>
    </div>
  );

  const departmentOptions = [
    {
      label: "Bachelor Programs",
      programs: [
        "Bachelor of Science in Business Administration",
        "Bachelor of Science in Civil Engineering",
        "Bachelor of Science in Computer Science",
        "Bachelor of Science in Information System Management",
      ],
    },
    {
      label: "Master Programs",
      programs: [
        "Master of Public Health",
        "Master of Science in Civil Engineering (M.Sc.)",
        "Master of Science in Business Administration (MSBA)",
        "Master of Science in Computer Science Engineering (MSCSE)",
      ],
    },
    {
      label: "Doctorate Programs",
      programs: [
        "Doctor of Business Management",
        "Doctor of Public Health",
        "Doctor of Science in Computer Science",
        "Doctor of Management",
      ],
    },
    {
      label: "Associate Programs",
      programs: ["English as a Second Language"],
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Courses</h2>

      <div className="form-control w-full max-w-xs mx-auto mb-8">
        <label className="label mb-2">
          <span className="label-text font-medium">Filter by Department</span>
        </label>
        <select
          className="select select-bordered"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {departmentOptions.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {loading && <p className="text-center text-lg">Loading courses...</p>}

      {enrolledCourseIds.length > 0 && (
        <div className="mb-10">
          <h3 className="text-2xl font-semibold text-primary mb-4">
            Enrolled Courses
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter((c) => enrolledCourseIds.includes(c._id))
              .map((course) => renderCourseCard(course, true))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-semibold text-primary mb-4">
          Other Available Courses
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((c) => !enrolledCourseIds.includes(c._id))
            .map((course) => renderCourseCard(course, false))}
        </div>
      </div>

      {!loading && courses?.length === 0 && (
        <p className="text-center col-span-3 text-gray-500">
          No courses available for the selected department.
        </p>
      )}
    </div>
  );
};

export default StudentsCourses;
