import React, { useState, useEffect } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import useAuth from "../../../Components/Hooks/useAuth";
import { FaChalkboardTeacher } from "react-icons/fa";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";

const FacultyGrades = () => {
  const { user } = useAuth();
  const email = user?.email;
  const axiosInstance = AxiosSecure();

  const { data: fetchedCourses, loading: courseLoading } = useFetchData(
    `${email}`,
    `/faculty-assign/courses/${email}`
  );

  const courses = Array.isArray(fetchedCourses)
    ? fetchedCourses
    : fetchedCourses?.data || [];

  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});

  // 🔁 Reusable fetch students function
  const fetchStudents = async () => {
    if (!selectedCourse || !semester) return;

    try {
      const res = await axiosInstance.get(
        `/students-by-course?courseId=${selectedCourse}&semester=${semester}`
      );
      const studentsData = res.data;
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
        setGrades({});
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch students:", error);
      setStudents([]);
    }
  };

  // 📦 Call fetch on dependency change
  useEffect(() => {
    fetchStudents();
  }, [selectedCourse, semester, axiosInstance]);

  const handleGradeChange = (studentEmail, point) => {
    setGrades({ ...grades, [studentEmail]: point });
  };

  const handleSubmit = async () => {
    if (!semester) {
      return Swal.fire({
        icon: "warning",
        title: "Select Semester",
        text: "Please select a semester.",
      });
    }

    const gradedData = students
      .filter((s) => {
        const point = parseFloat(grades[s.email]);
        return (
          !s.alreadyGraded?.point && !isNaN(point) && point >= 0 && point <= 5
        );
      })
      .map((student) => ({
        studentEmail: student.email,
        studentName: student.name,
        courseId: selectedCourse,
        facultyEmail: email,
        point: parseFloat(grades[student.email]),
        outOf: 5.0,
        submittedAt: new Date(),
      }));

    if (gradedData.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Valid Grades",
        text: "Please enter at least one valid grade (0.00 – 5.00).",
      });
    }

    try {
      const res = await axiosInstance.post("/student-grades/upsert", {
        studentGrades: gradedData,
        semester,
      });

      const { success, alreadyGraded, upsertCount } = res.data;

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Grades Submitted",
          text: `${upsertCount} grade(s) submitted successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
        setGrades({});
        await fetchStudents(); // ✅ REFETCH to update UI
      }

      if (!success && alreadyGraded?.length > 0) {
        const list = alreadyGraded
          .map((s, i) => `${i + 1}. ${s.studentName}`)
          .join("\n");

        Swal.fire({
          icon: "warning",
          title: "Some Grades Already Submitted",
          html: `<pre style="text-align:left">${list}</pre>`,
        });
      }
    } catch (err) {
      console.error("❌ Grade submission failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit grades.",
      });
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary flex items-center justify-center gap-2">
        <FaChalkboardTeacher /> Assign Grades
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:gap-5">
        <div className="form-control w-full sm:max-w-xs mb-4">
          <label className="label">
            <span className="label-text font-medium">Select Quarter</span>
          </label>
          <select
            className="select select-bordered"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">-- Choose a Quarter --</option>
            <option value="Quarter-1">Quarter-1</option>
            <option value="Quarter-2">Quarter-2</option>
            <option value="Quarter-3">Quarter-3</option>
            <option value="Quarter-3">Quarter-3</option>
            <option value="Quarter-4">Quarter-4</option>
            <option value="Quarter-5">Quarter-5</option>
            <option value="Quarter-6">Quarter-6</option>
            <option value="Quarter-7">Quarter-7</option>
            <option value="Quarter-8">Quarter-8</option>
            <option value="Quarter-9">Quarter-9</option>
            <option value="Quarter-10">Quarter-10</option>
            <option value="Quarter-11">Quarter-11</option>
            <option value="Quarter-12">Quarter-12</option>
            <option value="Quarter-13">Quarter-13</option>
            <option value="Quarter-14">Quarter-14</option>
            <option value="Quarter-15">Quarter-15</option>
            <option value="Quarter-16">Quarter-16</option>
          </select>
        </div>

        <div className="form-control w-full sm:max-w-xs mb-4">
          <label className="label">
            <span className="label-text font-medium">Select a Course</span>
          </label>
          <select
            className="select select-bordered"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Choose a course --</option>
            {!courseLoading &&
              courses.map((course) => (
                <option key={course._id} value={course.courseId}>
                  {course.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Student Grade Table */}
      {selectedCourse && students?.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="table table-zebra bg-white shadow-lg rounded-lg">
            <thead className="bg-base-300">
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Grade Point (out of 5.00)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.email}>
                  <td>{idx + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      placeholder="e.g. 4.50"
                      value={
                        student.alreadyGraded?.point !== undefined
                          ? student.alreadyGraded.point.toFixed(2)
                          : grades[student.email] || ""
                      }
                      disabled={!!student.alreadyGraded?.point}
                      onChange={(e) =>
                        handleGradeChange(student.email, e.target.value)
                      }
                      className={`input input-bordered input-sm w-full max-w-xs ${
                        student.alreadyGraded?.point
                          ? "border-green-500 bg-green-50 font-semibold text-green-700"
                          : ""
                      }`}
                      title={
                        student.alreadyGraded?.point
                          ? "Grade already submitted"
                          : "Enter grade"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <button onClick={handleSubmit} className="btn btn-primary">
              Submit Grades
            </button>
          </div>
        </div>
      )}

      {selectedCourse && students?.length === 0 && (
        <div className="text-center mt-10 text-gray-500">
          No students found for this course and semester.
        </div>
      )}
    </div>
  );
};

export default FacultyGrades;
