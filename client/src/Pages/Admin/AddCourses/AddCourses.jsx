import { useState } from "react";
import addCoursesImage from "../../../assets/addCourses.jpg"
import AxiosSecure from "../../../Components/Hooks/AxiosSecure";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

const AddCourses = () => {
  const [formData, setFormData] = useState({
    course: "",
    name: "",
    credit: "",
    description: "",
    date : new Date().toISOString()
  });

  const axiosInstance = AxiosSecure()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    try{
      const res = await axiosInstance.post('/add-courses',formData)
    if(res?.data?.insertedId){
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Course Added Successfully",
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/dashboard/courses')
    }
    }
    catch(err){
      Swal.fire({
        title: "Error occurs",
        icon: "error",
        text:"Please try again",
        draggable: true
      });
    }
  };

  return (
    <div className="mockup-window border border-base-300 w-full p-4 mt-6">
  <div className="flex gap-5 flex-col-reverse md:flex-row items-center ">
    {/* image-container */}
    <div className="w-fit md:w-1/2">
    <img src={addCoursesImage} alt="Add courses image" />
    </div>
    {/* form-container */}
    <div className="w-fit md:w-1/2 rounded-3xl  ">
    <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full"
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
  </div>
</div>
  );
};

export default AddCourses;
