import { useState, useEffect } from "react";
import { useWeb3 } from "../../hooks/useWeb3";
import { useContracts } from "../../hooks/useContracts";
import { useNavigate } from "react-router-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function FileComplaints() {
  const { account } = useWeb3();
  const { getUserPayments, getProperty } = useContracts();
  const navigate = useNavigate();

  const [tenantProperties, setTenantProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [propertyError, setPropertyError] = useState("");
  // Demo complaints for tenant
  const [complaints, setComplaints] = useState([
    { id: 1, property: { id: 1, title: "Property #001", address: "123 Main St", landlord: "0x123...abc", rentAmount: "1200", image: "https://via.placeholder.com/150" }, date: "2024-07-02", reason: "Heating not working", status: "Open" },
    { id: 2, property: { id: 2, title: "Property #002", address: "456 Oak Ave", landlord: "0x456...def", rentAmount: "950", image: "https://via.placeholder.com/150" }, date: "2024-07-04", reason: "Broken window", status: "Open" },
    { id: 3, property: { id: 3, title: "Property #003", address: "789 Pine Rd", landlord: "0x789...ghi", rentAmount: "1100", image: "https://via.placeholder.com/150" }, date: "2024-07-06", reason: "Noisy neighbors", status: "Withdrawn" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ propertyId: "", reason: "" });
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 6;
  const totalPages = Math.ceil(complaints.length / complaintsPerPage);
  const paginatedComplaints = complaints.slice((currentPage - 1) * complaintsPerPage, currentPage * complaintsPerPage);

  // Fetch tenant's rented properties from blockchain
  useEffect(() => {
    async function fetchTenantProperties() {
      setLoadingProperties(true);
      setPropertyError("");
      try {
        // Get all payments for this tenant
        const paymentIds = await getUserPayments(account);
        const propertyMap = {};
        for (const pid of paymentIds) {
          const payment = await getProperty(pid);
          if (payment && payment.propertyId) {
            let address = payment.address || payment.location || payment.propertyAddress || "";
            let landlord = payment.landlord || "";
            let rentAmount = payment.rentAmount || payment.amount || "";
            let image = payment.image || "";
            // If not present, try to fetch full property details
            if ((!address || !landlord || !rentAmount || !image) && payment.propertyId) {
              try {
                const propDetails = await getProperty(payment.propertyId);
                address = address || propDetails?.location || propDetails?.address || "";
                landlord = landlord || propDetails?.landlord || "";
                rentAmount = rentAmount || propDetails?.rentAmount || "";
                image = image || propDetails?.image || "";
              } catch {}
            }
            propertyMap[payment.propertyId] = {
              id: payment.propertyId,
              title: payment.title || `Property #${payment.propertyId}`,
              address,
              landlord,
              rentAmount,
              image,
            };
          }
        }
        // Convert to array of {id, ...details}
        const properties = Object.entries(propertyMap).map(([id, v]) => ({ id, ...v }));
        setTenantProperties(properties);
      } catch (err) {
        setTenantProperties([]);
        setPropertyError("Failed to load your rented properties. Please try again later.");
      } finally {
        setLoadingProperties(false);
      }
    }
    fetchTenantProperties();
  }, [account, getUserPayments, getProperty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.propertyId || !form.reason) {
      setError("Please select a property and enter a reason.");
      return;
    }
    const property = tenantProperties.find(p => p.id.toString() === form.propertyId);
    setComplaints([
      ...complaints,
      {
        id: complaints.length + 1,
        property: property || { id: form.propertyId, title: form.propertyId, address: "", landlord: "", rentAmount: "", image: "" },
        date: new Date().toISOString().slice(0, 10),
        reason: form.reason,
        status: "Open",
      },
    ]);
    setShowForm(false);
    setForm({ propertyId: "", reason: "" });
    setError("");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center section-page !py-52 bg-gray-50">
      <h2 className="mb-10 text-5xl font-semibold text-primary text-center">My Complaints</h2>
      <button
        className="mb-8 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition text-2xl shadow-lg"
        onClick={() => setShowForm((v) => !v)}
      >
        {showForm ? "Cancel" : "File New Complaint"}
      </button>
      {showForm && (
        <form className="mb-16 p-10 bg-white rounded-2xl shadow-xl flex flex-col gap-8 w-full max-w-3xl border border-gray-200 mx-auto" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-2xl font-medium">
            Property
            {loadingProperties ? (
              <div className="text-lg text-gray-500">Loading properties...</div>
            ) : propertyError ? (
              <div className="text-lg text-red-500">{propertyError}</div>
            ) : (
              <select
                className="p-4 rounded border border-gray-300 text-xl"
                value={form.propertyId}
                onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
                required
              >
                <option value="">Select property...</option>
                {tenantProperties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}{p.address ? ` - ${p.address}` : ""}{p.rentAmount ? ` - $${p.rentAmount}` : ""}{p.landlord ? ` - Landlord: ${p.landlord}` : ""}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="flex flex-col gap-2 text-2xl font-medium">
            Reason
            <textarea
              className="p-4 rounded border border-gray-300 text-xl"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              required
              rows={4}
              placeholder="Describe the issue..."
            />
          </label>
          {error && <div className="text-red-500 font-semibold text-xl">{error}</div>}
          <button className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition text-2xl shadow" type="submit">
            Submit Complaint
          </button>
        </form>
      )}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-8">
        {paginatedComplaints.map((complaint) => (
          <div key={complaint.id} className="p-8 bg-white rounded-2xl shadow flex flex-col gap-4 border border-gray-100">
            {complaint.property.image && <img src={complaint.property.image} alt={complaint.property.title} className="object-cover w-full h-40 rounded mb-2" />}
            <h3 className="text-2xl font-bold text-primary">
              <span
                className="cursor-pointer hover:underline"
                onClick={() => navigate(`/dashboard/tenant-dashboard/properties/${complaint.property.id}`)}
                title="View property details"
              >
                {complaint.property.title}
              </span>
            </h3>
            {complaint.property.address && <p className="text-lg text-gray-500">{complaint.property.address}</p>}
            {complaint.property.rentAmount && <p className="text-lg text-gray-500">Rent: ${complaint.property.rentAmount}</p>}
            {complaint.property.landlord && (
              <p className="text-lg text-gray-500">
                Landlord: {" "}
                <a
                  href={`/dashboard/landlord-dashboard/profile/${complaint.property.landlord}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  title="View landlord profile"
                >
                  {complaint.property.landlord}
                </a>
              </p>
            )}
            <p className="text-lg text-gray-500">{complaint.date}</p>
            <p className="text-xl">{complaint.reason}</p>
            <p className={`text-2xl font-semibold ${complaint.status === 'Withdrawn' ? 'text-gray-400' : complaint.status === 'Open' ? 'text-yellow-600' : 'text-green-600'}`}>Status: {complaint.status}</p>
            {complaint.status === 'Open' && (
              <button
                className="mt-3 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-600 transition"
                onClick={() => {
                  setComplaints((prev) =>
                    prev.map((c) =>
                      c.id === complaint.id ? { ...c, status: 'Withdrawn' } : c
                    )
                  );
                }}
              >
                Withdraw Complaint
              </button>
            )}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-8 mt-12">
          <button
            className={`p-3 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition text-3xl disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            <IoChevronBack />
          </button>
          <span className="text-2xl font-semibold">Page {currentPage} of {totalPages}</span>
          <button
            className={`p-3 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition text-3xl disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            title="Next page"
          >
            <IoChevronForward />
          </button>
        </div>
      )}
    </div>
  );
}
