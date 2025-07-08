import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { isConnected, userRole } = useWeb3();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isConnected) {
      navigate('/connect-wallet');
      return;
    }

    // Redirect based on user role
    if (userRole === 'landlord') {
      navigate('/dashboard/landlord-dashboard');
    } else if (userRole === 'tenant') {
      navigate('/dashboard/tenant-dashboard');
    } else {
      // If role is not determined, show an error
      console.error('User role not determined');
    }
  }, [isConnected, userRole, navigate]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center w-full h-screen max-h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="mb-5 cursor-pointer w-fit">
          <img src="/logo.png" alt="logo image" loading="lazy" className="w-[20rem] h-fit cursor-pointer" />
        </div>
        <h3 className="text-3xl font-semibold text-secondary mb-4">{t("redirecting_dashboard")}</h3>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </div>
  );
} 