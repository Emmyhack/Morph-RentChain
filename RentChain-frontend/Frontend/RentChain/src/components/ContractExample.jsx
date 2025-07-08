import React, { useState, useEffect } from 'react';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../context/Web3Context';
import { PROPERTY_TYPES, PAYMENT_STATUS } from '../config/contracts';

const ContractExample = () => {
  const { account, isConnected, userRole } = useWeb3();
  const {
    addProperty,
    getProperty,
    getLandlordProperties,
    createPayment,
    getPayment,
    getUserPayments,
    getPlatformStats,
    loading,
    error,
    clearError
  } = useContracts();

  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Form states
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    propertyType: 0,
    rentAmount: '',
    ipfsHash: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    landlord: '',
    propertyId: '',
    amount: '',
    dueDate: ''
  });

  // Load user's properties
  useEffect(() => {
    if (isConnected && userRole === 'landlord') {
      loadUserProperties();
    }
  }, [isConnected, userRole]);

  // Load user's payments
  useEffect(() => {
    if (isConnected) {
      loadUserPayments();
    }
  }, [isConnected]);

  // Load platform stats
  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadUserProperties = async () => {
    try {
      const propertyIds = await getLandlordProperties();
      const propertyDetails = [];
      
      for (const id of propertyIds) {
        const property = await getProperty(id);
        if (property) {
          propertyDetails.push(property);
        }
      }
      
      setProperties(propertyDetails);
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  };

  const loadUserPayments = async () => {
    try {
      const paymentIds = await getUserPayments();
      const paymentDetails = [];
      
      for (const id of paymentIds) {
        const payment = await getPayment(id);
        if (payment) {
          paymentDetails.push(payment);
        }
      }
      
      setPayments(paymentDetails);
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  };

  const loadPlatformStats = async () => {
    try {
      const stats = await getPlatformStats();
      setPlatformStats(stats);
    } catch (err) {
      console.error('Failed to load platform stats:', err);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    
    if (!propertyForm.title || !propertyForm.rentAmount || !propertyForm.ipfsHash) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await addProperty(
        propertyForm.title,
        propertyForm.propertyType,
        parseFloat(propertyForm.rentAmount),
        propertyForm.ipfsHash
      );

      if (result) {
        alert('Property added successfully!');
        setPropertyForm({
          title: '',
          propertyType: 0,
          rentAmount: '',
          ipfsHash: ''
        });
        loadUserProperties(); // Reload properties
      }
    } catch (err) {
      console.error('Failed to add property:', err);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.landlord || !paymentForm.propertyId || !paymentForm.amount || !paymentForm.dueDate) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const dueDate = new Date(paymentForm.dueDate);
      const result = await createPayment(
        paymentForm.landlord,
        parseInt(paymentForm.propertyId),
        parseFloat(paymentForm.amount),
        dueDate
      );

      if (result) {
        alert('Payment created successfully!');
        setPaymentForm({
          landlord: '',
          propertyId: '',
          amount: '',
          dueDate: ''
        });
        loadUserPayments(); // Reload payments
      }
    } catch (err) {
      console.error('Failed to create payment:', err);
    }
  };

  const getPropertyTypeName = (type) => {
    return type === PROPERTY_TYPES.HOUSE ? 'House' : 'Office';
  };

  const getPaymentStatusName = (status) => {
    const statusNames = {
      [PAYMENT_STATUS.PENDING]: 'Pending',
      [PAYMENT_STATUS.PAID]: 'Paid',
      [PAYMENT_STATUS.LATE]: 'Late',
      [PAYMENT_STATUS.DISPUTED]: 'Disputed',
      [PAYMENT_STATUS.REFUNDED]: 'Refunded'
    };
    return statusNames[status] || 'Unknown';
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Contract Integration Example</h2>
        <p className="text-gray-600">Please connect your wallet to interact with contracts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Contract Integration Example</h2>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={clearError}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Platform Stats */}
      {platformStats && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-xl font-bold">{platformStats.totalProperties}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Complaints</p>
              <p className="text-xl font-bold">{platformStats.totalComplaints}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-xl font-bold">{platformStats.totalReports}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reminders</p>
              <p className="text-xl font-bold">{platformStats.totalReminders}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Form (Landlords only) */}
      {userRole === 'landlord' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Property</h3>
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title
              </label>
              <input
                type="text"
                value={propertyForm.title}
                onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter property title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                value={propertyForm.propertyType}
                onChange={(e) => setPropertyForm({...propertyForm, propertyType: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={PROPERTY_TYPES.HOUSE}>House</option>
                <option value={PROPERTY_TYPES.OFFICE}>Office</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (USDT)
              </label>
              <input
                type="number"
                value={propertyForm.rentAmount}
                onChange={(e) => setPropertyForm({...propertyForm, rentAmount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rent amount"
                min="1"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IPFS Hash
              </label>
              <input
                type="text"
                value={propertyForm.ipfsHash}
                onChange={(e) => setPropertyForm({...propertyForm, ipfsHash: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter IPFS hash"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Property...' : 'Add Property'}
            </button>
          </form>
        </div>
      )}

      {/* Create Payment Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Create Payment</h3>
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landlord Address
            </label>
            <input
              type="text"
              value={paymentForm.landlord}
              onChange={(e) => setPaymentForm({...paymentForm, landlord: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter landlord address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property ID
            </label>
            <input
              type="number"
              value={paymentForm.propertyId}
              onChange={(e) => setPaymentForm({...paymentForm, propertyId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter property ID"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USDT)
            </label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter payment amount"
              min="1"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={paymentForm.dueDate}
              onChange={(e) => setPaymentForm({...paymentForm, dueDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Payment...' : 'Create Payment'}
          </button>
        </form>
      </div>

      {/* User's Properties */}
      {userRole === 'landlord' && properties.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Properties</h3>
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold">{property.title}</h4>
                <p className="text-sm text-gray-600">
                  Type: {getPropertyTypeName(property.propertyType)}
                </p>
                <p className="text-sm text-gray-600">
                  Rent: {property.rentAmount} USDT/month
                </p>
                <p className="text-sm text-gray-600">
                  Status: {property.isAvailable ? 'Available' : 'Not Available'}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {property.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's Payments */}
      {payments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Your Payments</h3>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold">Payment #{payment.id}</h4>
                <p className="text-sm text-gray-600">
                  Property ID: {payment.propertyId}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: {payment.amount} USDT
                </p>
                <p className="text-sm text-gray-600">
                  Status: {getPaymentStatusName(payment.status)}
                </p>
                <p className="text-sm text-gray-600">
                  Due Date: {payment.dueDate.toLocaleDateString()}
                </p>
                {payment.paidDate && (
                  <p className="text-sm text-gray-600">
                    Paid Date: {payment.paidDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Messages */}
      {userRole === 'landlord' && properties.length === 0 && (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No properties found. Add your first property above.</p>
        </div>
      )}

      {payments.length === 0 && (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No payments found. Create your first payment above.</p>
        </div>
      )}
    </div>
  );
};

export default ContractExample; 