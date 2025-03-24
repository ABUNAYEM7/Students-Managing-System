import React from "react";
import useUserRole from "../../../Components/Hooks/useUserRole";
import StudentsProfileStats from "../../../Components/StudentsState/StudentsProfileStats";

const StudentDashboardHome = () => {
  const { data: user } = useUserRole();
  return (
    <div>
      {/* user-profile-info-container */}
      <div className="p-4 flex items-center flex-col md:flex-row gap-5 h-full">
        {/* image-container */}
        <div className="max-w-[150px] max-h-[200px] rounded-full ">
          <img
            className="w-full rounded-full"
            src={user?.data?.photo}
            alt="profile-picture"
          />
        </div>
        {/* info-container */}
        <div className="space-y-2">
          <h3 className="text-xl md:text-3xl font-black uppercase">
            {user?.data?.name}
          </h3>
          <h3 className="text-lg md:text-xl font-medium ">
            <span className="text-base">Email :</span> {user?.data?.email}
          </h3>
          <h3 className="text-lg md:text-xl font-medium uppercase">
            <span className="text-base">Phone :</span> N/A
          </h3>
        </div>
      </div>
      {/* user-state-container */}
        <div>
          <StudentsProfileStats 
          attendance={70}
          grades={60}
          courses={50}
          />
        </div>
      </div>
  );
};

export default StudentDashboardHome;
