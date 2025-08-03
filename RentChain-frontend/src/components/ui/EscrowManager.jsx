import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBackSharp, 
  IoShieldCheckmarkOutline, 
  IoTimeOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import { Button } from '../common/Button';

const EscrowManager = () => {
  const { account, isConnected, formatAddress } = useWeb3();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    landlord: '',
    propertyId: '',
    amount: '',
    dueDate: ''
  });

  // Mock escrow data generation
  const generateMockEscrows = () => {
    const statuses = ['pending', 'paid', 'disputed', 'released', 'refunded'];
    const properties = [
      'Modern Downtown Apartment',
      'Luxury Penthouse Suite',
      'Cozy Garden Studio',
      'Family Townhouse',
      'Executive Office Suite'
    ];

    return Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      tenant: account,
      landlord: `0x742d35Cc6635C0532925a3b8D0Ea6a647e8bb00${index}`,
      propertyTitle: properties[index % properties.length],
      propertyId: index + 1,
      amount: (1500 + (index * 300)),
      dueDate: new Date(Date.now() + (index * 7 * 24 * 60 * 60 * 1000)),
      paidDate: index < 3 ? new Date(Date.now() - (index * 24 * 60 * 60 * 1000)) : null,
      status: statuses[index % statuses.length],
      paymentType: index % 2 === 0 ? 'USDT' : 'Fiat',
      transactionHash: index < 3 ? `0x${Math.random().toString(16).substr(2, 64)}` : '',
      disputeReason: index === 2 ? 'Property maintenance issue not resolved' : '',
      createdAt: new Date(Date.now() - (index * 30 * 24 * 60 * 60 * 1000))
    }));
  };

  const fetchEscrows = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, isRefresh ? 1000 : 2000));
      
      const mockEscrows = generateMockEscrows();
      setEscrows(mockEscrows);
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isConnected && account) {
      fetchEscrows();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchEscrows(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, account]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'disputed': return 'text-red-600 bg-red-100';
      case 'released': return 'text-blue-600 bg-blue-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return IoTimeOutline;
      case 'paid': return IoCheckmarkCircleOutline;
      case 'disputed': return IoAlertCircleOutline;
      case 'released': return IoShieldCheckmarkOutline;
      case 'refunded': return IoCloseCircleOutline;
      default: return IoDocumentTextOutline;
    }
  };

  const handleCreateEscrow = async (e) => {
    e.preventDefault();
    console.log('Creating escrow:', createForm);
    
    // Mock creation
    const newEscrow = {
      id: escrows.length + 1,
      tenant: account,
      landlord: createForm.landlord,
      propertyTitle: 'New Property',
      propertyId: parseInt(createForm.propertyId),
      amount: parseFloat(createForm.amount),
      dueDate: new Date(createForm.dueDate),
      paidDate: null,
      status: 'pending',
      paymentType: 'USDT',
      transactionHash: '',
      disputeReason: '',
      createdAt: new Date()
    };

    setEscrows(prev => [newEscrow, ...prev]);
    setShowCreateForm(false);
    setCreateForm({
      landlord: '',
      propertyId: '',
      amount: '',
      dueDate: ''
    });
  };

  const handlePayEscrow = async (escrowId) => {
    console.log('Paying escrow:', escrowId);
    
    setEscrows(prev => prev.map(escrow => 
      escrow.id === escrowId 
        ? { 
            ...escrow, 
            status: 'paid', 
            paidDate: new Date(),
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
          }
        : escrow
    ));
  };

  const handleDisputeEscrow = async (escrowId, reason) => {
    console.log('Disputing escrow:', escrowId, reason);
    
    setEscrows(prev => prev.map(escrow => 
      escrow.id === escrowId 
        ? { ...escrow, status: 'disputed', disputeReason: reason }
        : escrow
    ));
  };

  if (!isConnected) {
    return (
      <div className="w-full section-page !py-52">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">{t('connect_wallet_required') || 'Wallet Connection Required'}</h2>
          <p className="text-2xl text-gray-600 mb-8">{t('connect_wallet_to_access_escrow') || 'Please connect your wallet to access escrow management'}</p>
          <Button 
            name={t('connect_wallet') || 'Connect Wallet'} 
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full section-page !py-52">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-2xl text-gray-600">{t('loading_escrows') || 'Loading escrows...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full section-page !py-52">
      <div className="relative w-full pt-20">
        <div
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
        >
          <IoArrowBackSharp className="text-4xl" />
          <span className="text-3xl font-medium">{t('back') || 'Back'}</span>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-5xl font-bold mb-4">{t('escrow_management') || 'Escrow Management'}</h1>
              <p className="text-2xl text-gray-600">{t('escrow_description') || 'Secure rent payments with blockchain escrow protection'}</p>
              <div className="mt-4 flex items-center gap-4 text-lg text-gray-500">
                <IoWalletOutline className="text-xl" />
                <span>{formatAddress(account)}</span>
                <button 
                  onClick={() => fetchEscrows(true)}
                  disabled={refreshing}
                  className="ml-4 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  <IoRefreshOutline className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <Button
              name={t('create_escrow') || 'Create Escrow'}
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 hover:bg-green-600"
            />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: t('total_escrows') || 'Total Escrows', value: escrows.length, color: 'blue' },
              { label: t('pending_payments') || 'Pending', value: escrows.filter(e => e.status === 'pending').length, color: 'yellow' },
              { label: t('completed_payments') || 'Completed', value: escrows.filter(e => e.status === 'paid').length, color: 'green' },
              { label: t('disputed_payments') || 'Disputed', value: escrows.filter(e => e.status === 'disputed').length, color: 'red' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Escrows List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">{t('escrow_transactions') || 'Escrow Transactions'}</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('property') || 'Property'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('amount') || 'Amount'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('due_date') || 'Due Date'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('status') || 'Status'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('landlord') || 'Landlord'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {escrows.map((escrow) => {
                    const StatusIcon = getStatusIcon(escrow.status);
                    return (
                      <tr key={escrow.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{escrow.propertyTitle}</div>
                          <div className="text-sm text-gray-500">ID: {escrow.propertyId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${escrow.amount}</div>
                          <div className="text-sm text-gray-500">{escrow.paymentType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {escrow.dueDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(escrow.status)}`}>
                            <StatusIcon className="text-lg" />
                            {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {formatAddress(escrow.landlord)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {escrow.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePayEscrow(escrow.id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                              >
                                {t('pay') || 'Pay'}
                              </button>
                              <button
                                onClick={() => handleDisputeEscrow(escrow.id, 'Issue with property')}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                              >
                                {t('dispute') || 'Dispute'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedEscrow(escrow)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            {t('details') || 'Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Escrow Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
              <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-xl">
                <h2 className="text-3xl font-bold mb-6">{t('create_new_escrow') || 'Create New Escrow'}</h2>
                <form onSubmit={handleCreateEscrow} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('landlord_address') || 'Landlord Address'}
                    </label>
                    <input
                      type="text"
                      value={createForm.landlord}
                      onChange={(e) => setCreateForm({...createForm, landlord: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('property_id') || 'Property ID'}
                    </label>
                    <input
                      type="number"
                      value={createForm.propertyId}
                      onChange={(e) => setCreateForm({...createForm, propertyId: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('amount_usd') || 'Amount (USD)'}
                    </label>
                    <input
                      type="number"
                      value={createForm.amount}
                      onChange={(e) => setCreateForm({...createForm, amount: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="1500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('due_date') || 'Due Date'}
                    </label>
                    <input
                      type="date"
                      value={createForm.dueDate}
                      onChange={(e) => setCreateForm({...createForm, dueDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {t('cancel') || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {t('create') || 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Escrow Details Modal */}
          {selectedEscrow && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
              <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-xl">
                <h2 className="text-3xl font-bold mb-6">{t('escrow_details') || 'Escrow Details'}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('property') || 'Property'}
                      </label>
                      <p className="text-lg">{selectedEscrow.propertyTitle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('amount') || 'Amount'}
                      </label>
                      <p className="text-lg font-semibold">${selectedEscrow.amount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('tenant') || 'Tenant'}
                      </label>
                      <p className="text-lg font-mono">{formatAddress(selectedEscrow.tenant)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('landlord') || 'Landlord'}
                      </label>
                      <p className="text-lg font-mono">{formatAddress(selectedEscrow.landlord)}</p>
                    </div>
                  </div>
                  
                  {selectedEscrow.transactionHash && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('transaction_hash') || 'Transaction Hash'}
                      </label>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                        {selectedEscrow.transactionHash}
                      </p>
                    </div>
                  )}
                  
                  {selectedEscrow.disputeReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('dispute_reason') || 'Dispute Reason'}
                      </label>
                      <p className="text-lg text-red-600">{selectedEscrow.disputeReason}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedEscrow(null)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {t('close') || 'Close'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscrowManager;