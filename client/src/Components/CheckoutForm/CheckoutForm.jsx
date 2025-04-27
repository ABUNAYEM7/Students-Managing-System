import React, { useState, useEffect } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import useAuth from '../Hooks/useAuth';
import AxiosSecure from '../Hooks/AxiosSecure';

const CheckoutForm = ({refetch}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useAuth();
  const axiosInstance = AxiosSecure();

  useEffect(() => {
    if (user) {
      setBillingDetails((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setMessage(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // 1️⃣ Create Payment Method first
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
        },
      });

      if (paymentMethodError) {
        setMessage(paymentMethodError.message);
        setIsProcessing(false);
        return;
      }

      console.log('✅ PaymentMethod created:', paymentMethod.id);

      // 2️⃣ Request Backend to create PaymentIntent
      const response = await axiosInstance.post('/create-payment-intent', {
        amount, // you already have amount from input
      });

      const clientSecret = response.data.clientSecret;

      if (!clientSecret) {
        throw new Error('Failed to get client secret from server');
      }

      console.log('✅ Client Secret received:', clientSecret);

      // 3️⃣ Confirm payment now using clientSecret
      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (confirmResult.error) {
        console.error('❌ Payment failed:', confirmResult.error.message);
        setMessage(confirmResult.error.message);
      } else if (confirmResult.paymentIntent.status === 'succeeded') {
        if (confirmResult.paymentIntent.status === 'succeeded') {
            console.log('🎉 Payment succeeded:', confirmResult.paymentIntent.id);
          
            // 👉 Save payment record to database
            await axiosInstance.post('/payments', {
              transactionId: confirmResult.paymentIntent.id,
              userName: billingDetails.name,
              userEmail: billingDetails.email,
              phone: billingDetails.phone,
              amount,
              status: "paid",
              date: new Date().toISOString(),
            });
            refetch()
            setMessage('🎉 Payment Successful! Thank you!');
            setBillingDetails({ name: user.displayName, email: user.email, phone: '' });
            setAmount('');
            cardElement.clear(); // clear card input
          }
      }
    } catch (error) {
      console.error('❌ Payment error:', error.message);
      setMessage(error.message || 'Payment failed, please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          className="input input-bordered w-full mt-1 bg-gray-100"
          value={billingDetails.name}
          readOnly
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          className="input input-bordered w-full mt-1 bg-gray-100"
          value={billingDetails.email}
          readOnly
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          className="input input-bordered w-full mt-1"
          value={billingDetails.phone}
          onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
          required
          placeholder="+1 234 567 8901"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
        <input
          type="number"
          className="input input-bordered w-full mt-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="Enter Amount"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
        <div className="p-4 border rounded-lg">
          <CardElement />
        </div>
      </div>

      {message && (
        <div className="text-center text-red-500 font-medium">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn bg-prime w-full"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default CheckoutForm;
