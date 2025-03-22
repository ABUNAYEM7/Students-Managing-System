import React from "react";
import useAuth from "../../../Components/Hooks/useAuth";

const AdminDashboardHome = () => {
  const { user } = useAuth();
  return (
    <div>
      <h3 className="text-2xl font-semibold text-center mt-6">
        Welcome Dear {user?.displayName}
      </h3>
      <div className="mt-12 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
        <div className="card bg-primary text-primary-content max-w-[350px]">
          <div className="card-body">
            <h2 className="card-title">Card title!</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <p>total students</p>
            </div>
          </div>
        </div>
        <div className="card bg-primary text-primary-content max-w-[350px]">
          <div className="card-body">
            <h2 className="card-title">Card title!</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <p>total Teachers</p>
            </div>
          </div>
        </div>
        <div className="card bg-primary text-primary-content max-w-[350px]">
          <div className="card-body">
            <h2 className="card-title">Card title!</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <p>total parents</p>
            </div>
          </div>
        </div>
        <div className="card bg-primary text-primary-content max-w-[350px]">
          <div className="card-body">
            <h2 className="card-title">Card title!</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <p>total staffs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
