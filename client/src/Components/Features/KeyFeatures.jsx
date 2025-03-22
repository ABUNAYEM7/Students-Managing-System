import React from "react";

const KeyFeatures = () => {
  const features = [
    {
      title: "Student Portal",
      description:
        "Course enrollment, grade tracking, fee payment, and academic records management.",
    },
    {
      title: "Faculty Dashboard",
      description:
        "Attendance management, grade submission, course materials, and student tracking.",
    },
    {
      title: "Admin Console",
      description:
        "Complete system management, user administration, and institutional reporting.",
    },
  ];
  return (
    <div>
      <h3 className="text-3xl md:text-4 lg:text-5xl font-black text-center">
        Key Features
      </h3>
      <p className="text-sm font-medium w-11/12 md:w-2/3 mx-auto text-center mt-3">
      Our platform offers essential tools for a seamless experience, including easy course enrollment, progress tracking, and secure payment integration. Designed for students, faculty, and admins, it provides a user-friendly interface to manage academic journeys, engage with materials, and track performance effectively.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 justify-items-center">
        {features.map((f,i) => (
         <div 
         key={i}
         className="card bg-base-100 max-w-96 shadow-sm transform transition-transform duration-300 hover:scale-105">
         <div className="card-body">
           <h2 className="card-title">{f.title}</h2>
           <p>{f.description}</p>
           <div className="card-actions justify-end">
             <button className="btn btn-primary">View Details</button>
           </div>
         </div>
       </div>
        ))}
      </div>
    </div>
  );
};

export default KeyFeatures;
