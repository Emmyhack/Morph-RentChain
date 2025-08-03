import React, { useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useNavigate } from 'react-router-dom';

export default function RoleGuard({ requiredRole, children }) {
  const { isConnected, userRole, registerWallet, account } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    // If not connected, redirect to connect wallet
    if (!isConnected) {
      navigate('/');
      return;
    }

    // If user is connected but doesn't have a role assigned, register them to the required role
    if (isConnected && account && !userRole) {
      registerWallet(account, requiredRole);
    }
  }, [isConnected, userRole, requiredRole, navigate, account, registerWallet]);

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

  // If user is connected, allow access and register their wallet if needed
  return children;
} 