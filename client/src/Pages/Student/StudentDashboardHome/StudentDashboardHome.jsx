import React, { useEffect, useState } from "react";
import useUserRole from "../../../Components/Hooks/useUserRole";
import StudentsProfileStats from "../../../Components/StudentsState/StudentsProfileStats";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const StudentDashboardHome = () => {
  const { data: user } = useUserRole();
  const axiosInstance = AxiosSecure();

  const [studentInfo, setStudentInfo] = useState(null);
  const [courseOutline, setCourseOutline] = useState(null);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (user?.data?.email) {
        try {
          const res = await axiosInstance.get(`/student/${user.data.email}`);
          setStudentInfo(res.data);
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("❌ Error fetching student info:", err);
          }
        }
      }
    };
    fetchStudentInfo();
  }, [user, axiosInstance]);

  useEffect(() => {
    const fetchCourseOutline = async () => {
      if (studentInfo?.department) {
        try {
          const res = await axiosInstance.get(
            `/course-distribution/${encodeURIComponent(studentInfo.department)}`
          );
          setCourseOutline(res.data);
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("❌ Error fetching course distribution:", err);
          }
        }
      }
    };
    fetchCourseOutline();
  }, [studentInfo, axiosInstance]);

  return (
    <div className="p-4">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row items-center gap-5 mb-6">
        <div className="avatar">
          <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={studentInfo?.photo} alt="Student" />
          </div>
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl font-bold uppercase">{studentInfo?.name}</h1>
          <p className="text-sm md:text-base">📧 {studentInfo?.email}</p>
          <p className="text-sm md:text-base">🏛 Dept: {studentInfo?.department}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StudentsProfileStats attendance={70} grades={60} courses={50} />
      </div>

      {/* Course Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-3">📚 Course Distribution Outline</h2>
        {courseOutline?.quarters?.length > 0 ? (
          courseOutline.quarters.map((quarter, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-bold mb-2 text-highlight">
                Quarter {quarter.quarter || index + 1}
              </h3>

              {/* Show note if exists */}
              {quarter.note && (
                <p className="text-md font-bold italic text-black mb-2">📝 {quarter.note}</p>
              )}

              {/* Show course table if courses exist */}
              {quarter.courses?.length > 0 ? (
                <div className="overflow-x-auto bg-base-100 shadow rounded-lg max-w-[80%] mx-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="text-base text-base-content">
                        <th>#</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarter.courses.map((course, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{course.code || "N/A"}</td>
                          <td>{course.name}</td>
                          <td>{course.credits || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !quarter.note && (
                  <p className="text-warning mt-2">
                    ⚠️ No course data available for this quarter.
                  </p>
                )
              )}
            </div>
          ))
        ) : (
          <p className="text-error">No course outline found for this department.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardHome;
