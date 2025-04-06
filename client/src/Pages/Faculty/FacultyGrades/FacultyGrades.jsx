import React, { useState, useEffect } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import useAuth from "../../../Components/Hooks/useAuth";
import { FaChalkboardTeacher } from "react-icons/fa";
import Swal from "sweetalert2";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { all } from "axios";

const FacultyGrades = () => {
  const { user } = useAuth();
  const email = user?.email;
  const axiosInstance = AxiosSecure();
  const {
    data: courses,
    loading: courseLoading,
    error,
  } = useFetchData(`${email}`, `/faculty-assign/courses/${email}`);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    if (selectedCourse) {
      const dummyStudents = [
        { id: 1, name: "Alice Johnson", email: "alice@mail.com" },
        { id: 2, name: "Bob Smith", email: "bob@mail.com" },
        { id: 3, name: "Charlie Brown", email: "charlie@mail.com" },
        { id: 4, name: "Test", email: "test@gmail.com" },
      ];
      setStudents(dummyStudents);
      setGrades({});
    }
  }, [selectedCourse]);

  const handleGradeChange = (studentEmail, point) => {
    setGrades({ ...grades, [studentEmail]: point });
  };

  // submitHandler
  const handleSubmit = async () => {
    const gradedData = students
      .filter((s) => {
        const point = parseFloat(grades[s.email]);
        return !isNaN(point) && point >= 0 && point <= 5;
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
  
    if (!semester) {
      return Swal.fire({
        icon: "warning",
        title: "Select Semester",
        text: "Please select a semester.",
      });
    }
  
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

      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Grades Submitted",
          text: `${gradedData.length} grade(s) submitted successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
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
        {/* Semester Dropdown */}
        <div className="form-control w-full sm:max-w-xs mb-4">
          <label className="label">
            <span className="label-text font-medium">Select Semester</span>
          </label>
          <select
            className="select select-bordered"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">-- Choose a semester --</option>
            <option value="Spring 2025">Spring 2025</option>
            <option value="Fall 2025">Fall 2025</option>
            <option value="Summer 2025">Summer 2025</option>
          </select>
        </div>

        {/* Course Dropdown */}
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
              courses?.map((course) => (
                <option key={course._id} value={course.courseId || course.name}>
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
              {students?.map((student, idx) => (
                <tr key={student.id}>
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
                      className="input input-bordered input-sm w-full max-w-xs"
                      value={grades[student.email] || ""}
                      onChange={(e) =>
                        handleGradeChange(student.email, e.target.value)
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
          No students found for this course.
        </div>
      )}
    </div>
  );
};

export default FacultyGrades;
