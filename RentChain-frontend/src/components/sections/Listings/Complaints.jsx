import { useEffect, useState } from "react";

export default function Complaints() {
  // Mock complaints data
  const [complaints, setComplaints] = useState([
    { id: 1, tenant: "0x123...abcd", property: "Property #001", date: "2024-07-01", reason: "Leaky faucet", status: "Open" },
    { id: 2, tenant: "0x456...efgh", property: "Property #002", date: "2024-07-03", reason: "Noisy neighbors", status: "Resolved" },
    { id: 3, tenant: "0x789...ijkl", property: "Property #003", date: "2024-07-05", reason: "Broken heater", status: "Open" },
  ]);

  return (
    <div className="w-full section-page !py-52">
      <h2 className="mb-10 text-5xl font-semibold text-primary">Complaints</h2>
      <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-white border p-7 border-gray-200 shadow-sm rounded-xl hover:shadow-md">
            <h3 className="mb-2 text-3xl font-semibold">{complaint.property}</h3>
            <p className="text-2xl text-secondary mb-2">Tenant: <span className="font-mono">{complaint.tenant}</span></p>
            <p className="text-2xl text-secondary mb-2">Date: {complaint.date}</p>
            <p className="text-2xl text-secondary mb-2">Reason: <span className="font-normal">{complaint.reason}</span></p>
            <p className={`text-2xl font-semibold ${complaint.status === 'Resolved' ? 'text-green-600' : 'text-yellow-600'}`}>Status: {complaint.status}</p>
            {complaint.status === 'Open' && (
              <button
                className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                onClick={() => {
                  setComplaints((prev) =>
                    prev.map((c) =>
                      c.id === complaint.id ? { ...c, status: 'Resolved' } : c
                    )
                  );
                }}
              >
                Mark as Addressed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 