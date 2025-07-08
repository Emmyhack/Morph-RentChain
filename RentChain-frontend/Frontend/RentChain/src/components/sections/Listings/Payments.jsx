import { useEffect, useState } from "react";

export default function Payments() {
  // Mock payment data
  const [payments, setPayments] = useState([
    { id: 1, tenant: "0x123...abcd", property: "Property #001", amount: 1200, date: "2024-07-01", status: "Paid" },
    { id: 2, tenant: "0x456...efgh", property: "Property #002", amount: 950, date: "2024-07-03", status: "Pending" },
    { id: 3, tenant: "0x789...ijkl", property: "Property #003", amount: 1500, date: "2024-07-05", status: "Paid" },
  ]);

  return (
    <div className="w-full section-page !py-52">
      <h2 className="mb-10 text-5xl font-semibold text-primary">Payment History</h2>
      <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white border p-7 border-gray-200 shadow-sm rounded-xl hover:shadow-md">
            <h3 className="mb-2 text-3xl font-semibold">{payment.property}</h3>
            <p className="text-2xl text-secondary mb-2">Tenant: <span className="font-mono">{payment.tenant}</span></p>
            <p className="text-2xl text-secondary mb-2">Amount: <span className="font-bold text-primary">${payment.amount}</span></p>
            <p className="text-2xl text-secondary mb-2">Date: {payment.date}</p>
            <p className={`text-2xl font-semibold ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>Status: {payment.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 