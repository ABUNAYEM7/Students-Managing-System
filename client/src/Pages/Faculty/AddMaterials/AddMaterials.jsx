import React, { useState } from "react";

const AddMaterials = () => {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    file: null,
  });

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

    if (!courseId || !title || !file) {
      alert("All fields are required.");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    console.log("Submitting:", formData);

    // You can send this to your API
    // await fetch("/api/upload", {
    //   method: "POST",
    //   body: payload,
    // });
  };

  return (
   <div className="p-6">
     <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-1">Course Materials</h2>
      <p className="text-gray-600 mb-4">Upload and manage course materials</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Dropdown */}
        <select
          className="select select-bordered w-full"
          name="courseId"
          required
          value={formData.courseId}
          onChange={handleChange}
        >
          <option disabled value="">
            Select Course
          </option>
          <option value="455">455 - DSA</option>
          <option value="456">456 - Web Development</option>
          <option value="457">457 - Database Systems</option>
        </select>

        {/* Material Title */}
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
        <input
          type="file"
          name="file"
          className="file-input file-input-bordered w-full"
          accept=".pdf"
          required
          onChange={handleChange}
        />

        <button type="submit" className="btn btn-primary w-full">
          Upload Material
        </button>
      </form>
    </div>
   </div>
  );
};

export default AddMaterials;
