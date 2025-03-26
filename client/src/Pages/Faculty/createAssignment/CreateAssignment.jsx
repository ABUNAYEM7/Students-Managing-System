import React, { useEffect, useRef, useState } from "react";
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import useAuth from "../../../Components/Hooks/useAuth";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router";
import useFetchData from "../../../Components/Hooks/useFetchData";

const CreateAssignment = () => {
  const { id } = useParams();
  const { data } = id
    ? useFetchData(`${id}`, `/assignment/${id}`)
    : { data: null };
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    instructions: "",
    file: null,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();
  const { user } = useAuth();

  // useEffect to set the fetch data in the form
  useEffect(() => {
    if (id && data) {
      setFormData({
        courseId: data?.courseId || "",
        title: data?.title || "",
        instructions: data?.instructions || "",
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

  // handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { courseId, title, instructions, file } = formData;
    if (!courseId || !title || !instructions ||(!file && !id)) {
      setError("All fields are required.");
      return;
    }

    const data = new FormData();
    data.append("courseId", courseId);
    data.append("title", title);
    data.append("instructions", instructions);
    data.append("file", file);
    data.append("email", user?.email);

    try {
      if (id) {
        const res = await axiosInstance.patch(`/update-assignment/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res?.data?.modifiedCount > 0) {
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Assignment has been Updated",
            showConfirmButton: false,
            timer: 1500,
          });;
          return  navigate("/dashboard/assignment")
        }
      }

      const res = await axiosInstance.post("/upload-assignment", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Assignment has been created",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/dashboard/assignment");

        setFormData({
          courseId: "",
          title: "",
          instructions: "",
          file: null,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error", "Failed to upload assignment", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">Create Assignment</h2>
        <p className="text-gray-600 mb-4">Enter assignment details below</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Dropdown */}
          <label className="label">
            <span className="label-text">Select Course *</span>
          </label>
          <select
            className="select select-bordered w-full"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
          >
            <option disabled value="">
              Select Course
            </option>
            <option value="455">455 - DSA</option>
            <option value="456">456 - Web Development</option>
            <option value="457">457 - Database Systems</option>
          </select>

          {/* Title */}
          <label className="label">
            <span className="label-text">Assignment Title *</span>
          </label>
          <input
            type="text"
            name="title"
            className="input input-bordered w-full"
            placeholder="Enter title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          {/* Instructions */}
          <label className="label">
            <span className="label-text">Instructions *</span>
          </label>
          <textarea
            name="instructions"
            className="textarea textarea-bordered w-full"
            rows="5"
            placeholder="Enter instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
          ></textarea>

          {/* PDF Upload */}
          <label className="label">
            <span className="label-text">Upload PDF *</span>
          </label>
          {formData?.file === null && data?.filename && (
            <div className="mb-2 text-sm text-gray-600">
              Current File:{" "}
              <a
                href={`http://localhost:3000/${data?.path?.replace(
                  /\\/g,
                  "/"
                )}`}
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

          {error && (
            <label className="label">
              <span className="text-red-600 font-medium">{error}</span>
            </label>
          )}

          <button type="submit" className="btn btn-primary w-full">
            Submit Assignment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;
