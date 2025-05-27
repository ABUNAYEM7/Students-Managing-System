import React, { useEffect, useState } from "react";
import useUserRole from "../../../Components/Hooks/useUserRole";
import StudentsProfileStats from "../../../Components/StudentsState/StudentsProfileStats";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { Link } from "react-router";

const StudentDashboardHome = () => {
  const { data: user } = useUserRole();
  const axiosInstance = AxiosSecure();

  const [studentInfo, setStudentInfo] = useState(null);
  const [courseOutline, setCourseOutline] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    attendance: 0,
    grades: 0,
    courses: 0,
  });

  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (user?.data?.email) {
        try {
          const res = await axiosInstance.get(`/student/${user.data.email}`);
          setStudentInfo(res.data);
        } catch (err) {
          console.error("❌ Error fetching student info:", err);
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
          console.error("❌ Error fetching course distribution:", err);
        }
      }
    };
    fetchCourseOutline();
  }, [studentInfo, axiosInstance]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (user?.data?.email) {
        try {
          const res = await axiosInstance.get(
            `/student-dashboard-state/${user.data.email}`
          );
          const {
            attendancePercentage,
            gradePercentage,
            enrollmentPercentage,
          } = res.data;

          setDashboardStats({
            attendance: attendancePercentage,
            grades: gradePercentage,
            courses: enrollmentPercentage,
          });

        } catch (err) {
          console.error("❌ Error fetching dashboard stats:", err);
        }
      }
    };

    fetchDashboardStats();
  }, [user, axiosInstance]);

  const programFolders = [
    {
      name: "Bachelor of Science in Business Administration",
      link: "https://drive.google.com/drive/folders/1KPU32Ly-5YGZdq_B0HAbfnSUkUhOGy-w",
    },
    {
      name: "Bachelor of Science in Civil Engineering",
      link: "https://drive.google.com/drive/folders/1oEifztyOnywT3_kIrtf5CxHXT51e9MSh",
    },
    {
      name: "Bachelor of Science in Information Systems",
      link: "https://drive.google.com/drive/folders/1J7o9r934AUUBHm-JJ2PREXhj7-wj5Us8",
    },
    {
      name: "Bachelor of Science in Computer Science",
      link: "https://drive.google.com/drive/folders/1c9Wm-56wHoEsZj7o4_Zq-409P2PeiGru",
    },
    {
      name: "Bachelor of Science in Public Health",
      link: "https://drive.google.com/drive/folders/1_RlAq1jke91E9w8wzRVLXnf_jZmBqjWr",
    },
    {
      name: "Diploma in Business Management",
      link: "https://drive.google.com/drive/folders/1L4w0J8BtLdqw9QRZW48bU3wG0zwdNO2j",
    },
    {
      name: "Doctor of Management",
      link: "https://drive.google.com/drive/folders/1xLbTWuSxhz8N-JHSC9SsqQYbW8oUUfkh",
    },
    {
      name: "Doctor of Public Health",
      link: "https://drive.google.com/drive/folders/1z23Q7ip8IBXzaU01FAs26xufvPd4yBCA",
    },
    {
      name: "Doctor of Science in Computer Science and Engineering",
      link: "https://drive.google.com/drive/folders/1inJFmH8Rmja9bC20fzF_RwrmpUUljwDE",
    },
    {
      name: "English as a Second Language",
      link: "https://drive.google.com/drive/folders/1QaZDL8OdXafYUCV0lSbpRE0nA1rt0ALp",
    },
    {
      name: "Master of Public Health",
      link: "https://drive.google.com/drive/folders/1M2vaH4lmBQxj8B59AqksFFo7bNebTzQr",
    },
    {
      name: "Master of Science in Business Administration",
      link: "https://drive.google.com/drive/folders/1PPtKrOf1RnJQClU99xtkh7ToGGyRNqkg",
    },
    {
      name: "Master of Science in Civil Engineering",
      link: "https://drive.google.com/drive/folders/1NMGjhqauRZENMaM4pYdnK-9dlHUOXsGB",
    },
    {
      name: "Master of Science in Computer Science and Engineering",
      link: "https://drive.google.com/drive/folders/13IrZQ6h4YO6fkMf-iO79ouFw2cSvBA81",
    },
  ];

const matchedFolder = studentInfo
  ? programFolders.find((folder) => folder.name === studentInfo.department)
  : null;
  console.log(studentInfo?.department)

  return (
    <div className="p-4 mt-6">
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
          <p className="text-sm md:text-base">
            🏛 Dept: {studentInfo?.department}
          </p>
          <p className="text-sm md:text-base">
            🆔 Student Id: {studentInfo?.studentId}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <StudentsProfileStats
          attendance={dashboardStats.attendance}
          grades={dashboardStats.grades}
          courses={dashboardStats.courses}
        />
      </div>

      {/* Department Folder Link */}
      {matchedFolder && (
        <div className="my-10">
          <h2 className="text-lg font-semibold">
            📁 Departmental Curriculum Link:
          </h2>
          <a
            href={matchedFolder.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {matchedFolder.name}
          </a>
        </div>
      )}

      {/* Course Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          📚 Course Distribution Outline
        </h2>

        {courseOutline?.quarters?.length > 0 ? (
          courseOutline.quarters.map((quarter, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-lg font-bold mb-2 text-highlight">
                Quarter {quarter.quarter || index + 1}
              </h3>
              {quarter.note && (
                <p className="text-md font-bold italic text-black mb-2">
                  📝 {quarter.note}
                </p>
              )}
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
                          <td>{course.name || course.title}</td>
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
          <p className="text-error">
            No course outline found for this department.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardHome;
