import { useLocation, useNavigate } from "react-router";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import useAuth from "../../Components/Hooks/useAuth";
import useFetchData from "../../Components/Hooks/useFetchData";
import CheckoutForm from "../../Components/CheckoutForm/CheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_PK);

const PaymentPage = () => {
  const { user } = useAuth();
  const email = user?.email;
  const navigate = useNavigate();
  const { data: studentDetails = {}, refetch } = useFetchData(
    email,
    `/student-full-details/${email}`
  );

  const location = useLocation();
  const course = location.state?.course;

  if (!course) {
    navigate("/dashboard/fee");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-highlight">
          Complete Payment for {course.courseName}
        </h2>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            refetch={refetch}
            amount={course.fee}
            studentEmail={email}
            courseId={course.courseId}
            courseName={course.courseName}
          />
        </Elements>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/dashboard/fee")}
            className="btn btn-outline btn-sm"
          >
            Cancel and Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
