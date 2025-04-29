import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../../Components/CheckoutForm/CheckoutForm";
import useFetchData from "../../../Components/Hooks/useFetchData";
import useAuth from "../../../Components/Hooks/useAuth";

const stripePromise = loadStripe(`${import.meta.env.VITE_PAYMENT_PK}`);

const Fee = () => {
  const { user } = useAuth();
  const email = user?.email;
  const { data: studentDetails = {}, refetch } = useFetchData(
    email,
    `/student-full-details/${email}`
  );

  const [selectedCourse, setSelectedCourse] = useState(null);

  const handlePayClick = (course) => {
    setSelectedCourse(course);
    document.getElementById("payment_modal").showModal();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-highlight">
          Your Course Fees
        </h1>

        {studentDetails?.student?.courses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-gray-700 text-sm">
                  <th>#</th>
                  <th>Course Name</th>
                  <th>Semester</th>
                  <th>Fee</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentDetails.student.courses.map((course, index) => (
                  <tr key={course.courseId || index}>
                    <td>{index + 1}</td>
                    <td>{course?.courseName || "N/A"}</td>
                    <td>{course?.semester || "N/A"}</td>
                    <td>
                      {course?.fee && course?.fee > 0
                        ? `$${course.fee}`
                        : "Not Assigned"}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {course?.paymentStatus || "unpaid"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={!course?.fee || course?.fee === 0 || course.paymentStatus === 'paid'}
                        onClick={() => handlePayClick(course)}
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No enrolled courses found.
          </p>
        )}
      </div>

      {/* Payment Modal */}
      <dialog id="payment_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4 text-highlight">
            Complete Your Payment
          </h3>
          {selectedCourse && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                refetch={refetch}
                amount={selectedCourse?.fee}
                studentEmail={email}
                courseId={selectedCourse?.courseId}
                courseName={selectedCourse?.courseName}
              />
            </Elements>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Fee;
