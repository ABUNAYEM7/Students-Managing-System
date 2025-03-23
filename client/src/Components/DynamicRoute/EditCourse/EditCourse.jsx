import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useFetchData from "../../Hooks/useFetchData";
import Swal from "sweetalert2";
import AxiosSecure from "../../Hooks/AxiosSecure";

const EditCourse = () => {
  const { id } = useParams();
  const { data } = useFetchData(`${id}`, `/courses/${id}`);
  const [formData, setFormData] = useState({
    course: "",
    name: "",
    credit: "",
    description: "",
    date: "",
  });
  const axiosInstance = AxiosSecure()
  const navigate = useNavigate()

//   useEffect to set the previous data in the table
  useEffect(() => {
    if (data) {
      setFormData({
    course:data.course || "",
    name: data.name || "",
    credit:data.credit ||  "",
    description:data.description ||  "",
    date : data.date || ""
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await axiosInstance.patch(`/update-course/${id}`,formData)
        if(res?.data?.matchedCount > 0 && res?.data?.modifiedCount> 0 || res?.data?.matchedCount > 0 && res?.data?.modifiedCount === 0 ){
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Course Updated Successfully",
                showConfirmButton: false,
                timer: 1500
              });
            navigate('/dashboard/courses')
        }
    } catch (err) {
      Swal.fire({
        title: "Error occurs",
        icon: "error",
        text: "Please try again",
        draggable: true,
      });
    }
  };
  return (
    <div>
      <h3 className="text-3xl font-black text-center mt-6">Edit Course</h3>
      {/* form-container */}
      <div className="w-fit md:w-2/3 mx-auto rounded-3xl  mt-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-full"
        >
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

          <button type="submit" className="btn btn-primary w-full">
            Update Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
