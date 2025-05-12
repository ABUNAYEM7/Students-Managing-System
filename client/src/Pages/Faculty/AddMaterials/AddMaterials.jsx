import React, { useState, useEffect } from "react";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";

const AddMaterials = () => {
  const axiosInstance = AxiosSecure();
  const { user } = useAuth();

  const [departments] = useState([
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information System Management",
    "Master of Public Health",
    "Master of Science in Civil Engineering",
    "Master of Science in Business Administration",
    "Master of Science in Computer Science Engineering",
    "Doctor of Business Management",
    "Doctor of Public Health",
    "Doctor of Science in Computer Science",
    "Doctor of Management",
    "English as a Second Language"
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departmentCourses, setDepartmentCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    email: "",
    file: null
  });

  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedDepartment) return;
      try {
        const res = await axiosInstance.get(
          `/all-courses-by-department?department=${encodeURIComponent(selectedDepartment)}`
        );
        setDepartmentCourses(res.data);
      } catch (err) {
        console.error("Error fetching courses by department:", err);
      }
    };
    fetchCourses();
  }, [selectedDepartment, axiosInstance]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("title", formData.title);
    form.append("courseId", formData.courseId);
    form.append("email", formData.email);
    form.append("file", formData.file);

    try {
      await axiosInstance.post("/upload-file", form);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Material uploaded successfully!",
        confirmButtonColor: "#2563eb"
      });
      setFormData((prev) => ({
        ...prev,
        title: "",
        courseId: "",
        file: null
      }));
    } catch (err) {
      console.error("Upload failed:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Something went wrong while uploading.",
        confirmButtonColor: "#dc2626"
      });
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Course Material</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Select Department</label>
          <select
            className="select select-bordered w-full"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setFormData((prev) => ({ ...prev, courseId: "" }));
            }}
          >
            <option value="" disabled>
              Choose Department
            </option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Select Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="select select-bordered w-full"
            disabled={!selectedDepartment}
          >
            <option value="" disabled>
              Choose Course
            </option>
            {departmentCourses.map((course) => (
              <option key={course._id} value={course.courseId}>
                {course.name} - {course.courseId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Material Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={user?.email || ""}
            readOnly
            className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-1">Upload File (PDF only)</label>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            onChange={handleChange}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Upload Material
        </button>
      </form>
    </div>
  );
};

export default AddMaterials;
