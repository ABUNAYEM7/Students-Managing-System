import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../../../Components/CheckoutForm/CheckoutForm';
import useFetchData from '../../../Components/Hooks/useFetchData';
import useAuth from '../../../Components/Hooks/useAuth';

const stripePromise = loadStripe(`${import.meta.env.VITE_PAYMENT_PK}`);

const Fee = () => {
  const { user } = useAuth();
  const email = user?.email;
  const { data: paymentHistory = [],refetch } = useFetchData(`${email}`, `/payments/${email}`);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-highlight">Pay Your Fees</h1>
        <p className="text-center  mb-8 text-highlight">Secure payment powered by Stripe</p>

        <Elements stripe={stripePromise}>
          <CheckoutForm  refetch={refetch}/>
        </Elements>
      </div>

      {/* Payment History Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Your Payment History</h2>

        {paymentHistory.length === 0 ? (
          <p className="text-center text-gray-500">No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="text-gray-700 text-sm">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-100">
                    <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold">${payment.amount}</td>
                    <td className="p-3">{payment.phone}</td>
                    <td className="p-3">
                      <span className="badge badge-success">{payment.status}</span>
                    </td>
                    <td className="p-3 text-xs break-all">{payment.transactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fee;
