import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";
import AxiosSecure from "../Components/Hooks/AxiosSecure";
import useAuth from "../Components/Hooks/useAuth";

const Enroll = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const [formData, setFormData] = useState({
    city: "",
    country: "",
    currentAddress: "",
    permanentAddress: "",
    gender: "",
    enrollRequest: true, 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      email: user?.email,
      name: user?.displayName,
      photo: user?.photoURL || "",
      department: state?.program,
    };

    try {
      const res = await axiosInstance.patch(`/update/user-info/${user.email}`, payload);

      if (res.data?.modifiedCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Enrollment Submitted",
          text: `You have requested to enroll in ${state?.program}`,
        });
        navigate("/");
      } else {
        Swal.fire({
          icon: "info",
          title: "No Changes Made",
          text: "It seems you're already enrolled or no updates were needed.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto mt-20 bg-base-100 rounded shadow">
      <h1 className="text-3xl font-bold mb-8 text-center text-highlight">
        Enrollment Form
      </h1>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-600">Name</label>
          <input
            type="text"
            value={user?.displayName || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Department</label>
          <input
            type="text"
            value={state?.program || ""}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            readOnly
          />
        </div>

        {["city", "country", "currentAddress", "permanentAddress"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
              className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
              required
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-600 capitalize">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 bg-base-200 rounded-lg border border-[#0056b3] shadow-sm"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn bg-[#0056b3] text-white w-full col-span-2"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default Enroll;
