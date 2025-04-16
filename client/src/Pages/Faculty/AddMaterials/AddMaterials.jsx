import React, { useEffect, useRef, useState } from "react";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";

const AddMaterials = () => {
  const [err, setErr] = useState("");
  const { id } = useParams();
  const { data } = id ? useFetchData(`${id}`, `/material/${id}`) : { data: null };
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  // ✅ Get assigned courses dynamically
  const {
    data: courses,
    loading: coursesLoading,
  } = useFetchData(`${user?.email}`, `/faculty-assign/courses/${user?.email}`);

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    file: null,
  });

  useEffect(() => {
    if (id && data) {
      setFormData({
        courseId: data.courseId || "",
        title: data.title || "",
        file: null,
      });
    }
  }, [id, data]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { courseId, title, file } = formData;
    if (!courseId || !title || (!file && !id)) {
      setErr("All fields are required.");
      return;
    }

    const data = new FormData();
    data.append("courseId", courseId);
    data.append("title", title);
    data.append("email", user?.email);
    if (file) data.append("file", file);

    try {
      if (id) {
        const res = await axiosInstance.patch(`/update-material/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res?.data?.modifiedCount > 0) {
          return Swal.fire("Updated!", "Material has been updated.", "success");
        }
      }

      const res = await axiosInstance.post("/upload-file", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Your material has been uploaded",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/dashboard/materials");
        setFormData({ courseId: "", title: "", file: null });
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-1">Course Materials</h2>
        <p className="text-gray-600 mb-4">Upload and manage course materials</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Dropdown */}
          <label className="label">
            <span className="label-text">Select Course *</span>
          </label>
          <select
            className="select select-bordered w-full"
            name="courseId"
            required
            value={formData.courseId}
            onChange={handleChange}
          >
            <option disabled value="">Select Course</option>
            {!coursesLoading &&
              courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} - {course.courseId}
                </option>
              ))}
          </select>

          {/* Title Field */}
          <label className="label">
            <span className="label-text">Title *</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="Material title"
            className="input input-bordered w-full"
            required
            value={formData.title}
            onChange={handleChange}
          />

          {/* File Upload */}
          <label className="label">
            <span className="label-text">Upload File *</span>
          </label>
          {formData?.file === null && data?.filename && (
            <div className="mb-2 text-sm text-gray-600">
              Current File:{" "}
              <a
                href={`http://localhost:3000/${data?.path?.replace(/\\/g, "/")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {data?.originalname || "View File"}
              </a>
            </div>
          )}
          <input
            type="file"
            name="file"
            className="file-input file-input-bordered w-full"
            accept=".pdf"
            onChange={handleChange}
            ref={fileInputRef}
          />

          {err && (
            <label className="label">
              <span className="text-lg text-red-600 font-medium">{err}</span>
            </label>
          )}

          <button type="submit" className="btn btn-primary w-full">
            Upload Material
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMaterials;
