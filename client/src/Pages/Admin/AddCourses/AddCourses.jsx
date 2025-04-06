import { useState } from "react";
import addCoursesImage from "../../../assets/addCourses.jpg";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import useFetchData from "../../../Components/Hooks/useFetchData";

const AddCourses = () => {
  const [formData, setFormData] = useState({
    courseId: "",
    name: "",
    credit: "",
    description: "",
    facultyEmail: "",
    semester: "",
    department: "",
    date: new Date().toISOString(),
  });

  const { data: faculties } = useFetchData("faculties", "/all-faculties");
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      courseId,
      name,
      credit,
      description,
      facultyEmail,
      semester,
      department,
    } = formData;

    if (!courseId || !name || !credit || !description || !facultyEmail || !semester || !department) {
      return Swal.fire({
        icon: "warning",
        title: "All fields are required",
        text: "Please fill out every field including department and semester.",
      });
    }

    if (parseFloat(credit) <= 0) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Credit Value",
        text: "Credit must be a positive number.",
      });
    }

    try {
      const res = await axiosInstance.post("/add-courses", formData);
      if (res?.data?.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Course Added Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/dashboard/courses");
      }
    } catch (err) {
      Swal.fire({
        title: "Error Occurred",
        icon: "error",
        text: "Please try again.",
      });
    }
  };

  return (
    <div className="mockup-window border border-base-300 w-full p-4 mt-6">
      <div className="flex gap-5 flex-col-reverse md:flex-row items-center">
        <div className="w-fit md:w-1/2">
          <img src={addCoursesImage} alt="Add courses" />
        </div>

        <div className="w-fit md:w-1/2 rounded-3xl">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full"
          >
            <h2 className="text-xl font-bold text-center mb-4">Create Course</h2>

            {/* Semester Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Semester</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Semester</option>
                <option value="Spring 2025">Spring 2025</option>
                <option value="Summer 2025">Summer 2025</option>
                <option value="Fall 2025">Fall 2025</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Department</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Hospitality Management">Hospitality Management</option>
                <option value="Data Science">Data Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            {/* Course ID */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Course ID</span>
              </label>
              <input
                type="number"
                name="courseId"
                inputMode="numeric"
                pattern="\d*"
                min="0"
                onWheel={(e) => e.target.blur()}
                value={formData.courseId}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Course Name */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Course Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Credit */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Credit</span>
              </label>
              <input
                type="number"
                name="credit"
                value={formData.credit}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Description */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
                required
              ></textarea>
            </div>

            {/* Faculty Selection */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Assign Faculty</span>
              </label>
              <select
                name="facultyEmail"
                value={formData.facultyEmail}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Faculty</option>
                {faculties?.result?.map((faculty) => (
                  <option key={faculty._id} value={faculty.email}>
                    {faculty.firstName} {faculty.lastName} - {faculty.department}
                  </option>
                ))}
              </select>

              {/* Preview Card */}
              {formData.facultyEmail && (() => {
                const selectedFaculty = faculties?.result?.find(
                  (f) => f.email === formData.facultyEmail
                );
                return selectedFaculty ? (
                  <div className="card shadow-md mt-4 border p-4 flex flex-col md:flex-row items-center gap-4 bg-gray-50">
                    <img
                      src={selectedFaculty.staffPhoto}
                      alt="faculty"
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {selectedFaculty.firstName} {selectedFaculty.lastName}
                      </h3>
                      <p className="text-sm text-gray-700">
                        <strong>Department:</strong> {selectedFaculty.department}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Designation:</strong> {selectedFaculty.designation}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Email:</strong> {selectedFaculty.email}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourses;
