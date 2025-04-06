import React, { useState } from 'react';

const Fee = () => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [paymentHistory, setPaymentHistory] = useState([
    { date: '2024-09-01', amount: '1000', method: 'Credit Card' },
    { date: '2024-06-01', amount: '900', method: 'Credit Card' },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPayment = {
      date: new Date().toISOString().split('T')[0],
      amount: formData.amount,
      method: 'Credit Card'
    };
    setPaymentHistory([newPayment, ...paymentHistory]);
    alert('Payment successful!');
    setFormData({ name: '', amount: '', cardNumber: '', expiry: '', cvv: '' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Pay Your Fees</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={formData.cardNumber}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            value={formData.expiry}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <input
            type="password"
            name="cvv"
            placeholder="CVV"
            value={formData.cvv}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <button type="submit" className="btn btn-primary col-span-full">
            Pay Now
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.date}</td>
                    <td>${payment.amount}</td>
                    <td>{payment.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fee;
