import React, { useState } from "react";
import useFetchData from "../../../Components/Hooks/useFetchData";
import useAuth from "../../../Components/Hooks/useAuth";
import { FaBookOpen, FaCalendarAlt, FaUserGraduate } from "react-icons/fa";

const FacultyCourses = () => {
  const { user } = useAuth();
  const email = user?.email;

  const {
    data: courses,
    loading,
    error,
  } = useFetchData(`${email}`, `/faculty-assign/courses/${email}`);

  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-prime">
        Courses Assigned to You
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <span className="loading loading-bars loading-lg text-primary"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-4">
          <span>Error fetching courses. Please try again.</span>
        </div>
      )}

      {!loading && courses?.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <p>No courses assigned yet.</p>
        </div>
      )}

      {!loading && courses?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="card bg-white shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <h2 className="card-title text-xl font-semibold text-primary">
                  <FaBookOpen className="inline-block mr-2" />
                  {course.name}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Department:</strong> {course.department}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Course Code:</strong> {course.courseId}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <FaUserGraduate className="inline-block mr-1" />
                  <strong>Credit:</strong> {course.credit}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <FaCalendarAlt className="inline-block mr-1" />
                  <strong>Assigned On:</strong>{" "}
                  {new Date(course.date).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-700 mt-2">
                  {course.description?.slice(0, 120)}...
                </p>

                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-sm btn-outline bg-prime"
                    onClick={() => setSelectedCourse(course)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedCourse && (
        <dialog id="course_modal" className="modal modal-open">
          <div className="modal-box max-w-2xl relative">
            {/* Top-right Close (X) Button */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <h3 className="font-bold text-xl mb-3 text-primary">
              {selectedCourse.name}
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Course Code:</strong> {selectedCourse.course}
              </p>
              <p>
                <strong>Description:</strong> {selectedCourse.description}
              </p>
              <p>
                <strong>Credit:</strong> {selectedCourse.credit}
              </p>
              <p>
                <strong>Faculty Email:</strong> {selectedCourse.facultyEmail}
              </p>
              <p>
                <strong>Assigned On:</strong>{" "}
                {new Date(selectedCourse.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Course ID:</strong> {selectedCourse._id}
              </p>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-sm bg-highlight text-white"
                onClick={() => setSelectedCourse(null)}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default FacultyCourses;
