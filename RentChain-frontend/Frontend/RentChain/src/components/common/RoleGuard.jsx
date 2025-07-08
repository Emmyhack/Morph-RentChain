import React, { useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

export default function RoleGuard({ requiredRole, children }) {
  const { isConnected, userRole, canAccessRole } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    // If not connected, redirect to connect wallet
    if (!isConnected) {
      navigate('/');
      return;
    }

    // If user doesn't have the required role, stay on current page to show access denied
    // The navigation will be handled by the access denied UI
  }, [isConnected, navigate]);

  // If not connected, show loading while redirecting
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center w-full h-screen max-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="mb-5 cursor-pointer w-fit">
            <img src="/logo.png" alt="logo image" loading="lazy" className="w-[20rem] h-fit cursor-pointer" />
          </div>
          <h3 className="text-3xl font-semibold text-secondary mb-4">Redirecting to connect wallet...</h3>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If user doesn't have the required role, show access denied
  if (!canAccessRole(requiredRole)) {
    const currentRole = userRole || 'unknown';
    const requiredRoleDisplay = requiredRole === 'landlord' ? 'Landlord' : 'Tenant';
    const currentRoleDisplay = currentRole === 'landlord' ? 'Landlord' : 'Tenant';

    return (
      <div className="flex items-center justify-center w-full h-screen max-h-screen bg-gray-50">
        <div className="flex flex-col items-center w-full max-w-4xl px-10 py-10 bg-white shadow-sm rounded-xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-semibold text-red-600 mb-4">Access Denied</h2>
            <p className="text-2xl font-medium text-gray-700 mb-2">
              You are registered as a <span className="font-bold text-primary">{currentRoleDisplay}</span>
            </p>
            <p className="text-xl text-gray-600 mb-6">
              This {requiredRoleDisplay} dashboard is not accessible with your current wallet address.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button 
              onClick={() => navigate('/dashboard')} 
              name={`Go to ${currentRoleDisplay} Dashboard`}
              className="w-full"
            />
            <Button 
              onClick={() => navigate('/')} 
              name="Connect Different Wallet"
              className="w-full bg-gray-500 hover:bg-gray-600"
            />
          </div>
        </div>
      </div>
    );
  }

  // If user has the required role, render the children
  return children;
} 