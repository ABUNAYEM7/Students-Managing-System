import { useState } from "react";

const AddCourses = () => {
  const [formData, setFormData] = useState({
    course: "",
    name: "",
    credit: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center mb-4">Create Course</h2>
        
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Course</span>
          </label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        
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
        
        <button type="submit" className="btn btn-primary w-full">Create</button>
      </form>
    </div>
  );
};

export default AddCourses;
