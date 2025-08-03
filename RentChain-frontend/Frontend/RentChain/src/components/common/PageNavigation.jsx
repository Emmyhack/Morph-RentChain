import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../../context/Web3Context';

const PageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userRole } = useWeb3();

  // Define page routes and their order for navigation
  const getPageRoutes = () => {
    const baseRoutes = [
      { path: '/', name: t('connect_wallet') || 'Connect Wallet' },
      { path: '/dashboard', name: t('dashboard_selection') || 'Dashboard Selection' }
    ];

    if (userRole === 'landlord') {
      return [
        ...baseRoutes,
        { path: '/dashboard/landlord-dashboard', name: t('landlord_dashboard') || 'Landlord Dashboard' },
        { path: '/dashboard/landlord-dashboard/my-properties', name: t('my_properties') || 'My Properties' },
        { path: '/dashboard/landlord-dashboard/add-property', name: t('add_property') || 'Add Property' },
        { path: '/dashboard/landlord-dashboard/payments', name: t('payments') || 'Payments' },
        { path: '/dashboard/landlord-dashboard/complaints', name: t('complaints') || 'Complaints' },
        { path: '/dashboard/landlord-dashboard/chat', name: t('chat') || 'Chat' }
      ];
    } else if (userRole === 'tenant') {
      return [
        ...baseRoutes,
        { path: '/dashboard/tenant-dashboard', name: t('tenant_dashboard') || 'Tenant Dashboard' },
        { path: '/dashboard/tenant-dashboard/properties', name: t('browse_properties') || 'Browse Properties' },
        { path: '/dashboard/tenant-dashboard/payment', name: t('make_payment') || 'Make Payment' },
        { path: '/dashboard/tenant-dashboard/credit-score', name: t('credit_score') || 'Credit Score' },
        { path: '/dashboard/tenant-dashboard/complaints', name: t('file_complaints') || 'File Complaints' },
        { path: '/dashboard/tenant-dashboard/chat', name: t('chat') || 'Chat' }
      ];
    }

    return baseRoutes;
  };

  const pageRoutes = getPageRoutes();
  const currentIndex = pageRoutes.findIndex(route => route.path === location.pathname);
  
  // Check if we're on a dynamic route (e.g., property details)
  const isDynamicRoute = currentIndex === -1 && location.pathname.includes('/properties/');
  
  let adjustedIndex = currentIndex;
  if (isDynamicRoute) {
    // If on property details, treat as being after properties list
    const propertiesIndex = pageRoutes.findIndex(route => route.path.includes('/properties'));
    adjustedIndex = propertiesIndex;
  }

  const canGoBack = adjustedIndex > 0 || isDynamicRoute;
  const canGoForward = adjustedIndex < pageRoutes.length - 1 && adjustedIndex !== -1;

  const handlePrevious = () => {
    if (isDynamicRoute) {
      // Go back to properties list
      const propertiesRoute = pageRoutes.find(route => route.path.includes('/properties'));
      if (propertiesRoute) {
        navigate(propertiesRoute.path);
      } else {
        navigate(-1);
      }
    } else if (adjustedIndex > 0) {
      navigate(pageRoutes[adjustedIndex - 1].path);
    }
  };

  const handleNext = () => {
    if (adjustedIndex < pageRoutes.length - 1 && adjustedIndex !== -1) {
      navigate(pageRoutes[adjustedIndex + 1].path);
    }
  };

  const getCurrentPageName = () => {
    if (isDynamicRoute) {
      if (location.pathname.includes('/properties/')) {
        return t('property_details') || 'Property Details';
      }
    }
    return pageRoutes[adjustedIndex]?.name || t('current_page') || 'Current Page';
  };

  // Don't show navigation on certain pages
  const hideOnPages = ['/'];
  if (hideOnPages.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3 flex items-center gap-4">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!canGoBack}
          className={`p-3 rounded-full transition-all duration-200 ${
            canGoBack
              ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={t('previous_page') || 'Previous Page'}
        >
          <IoArrowBackOutline className="text-xl" />
        </button>

        {/* Current Page Indicator */}
        <div className="px-4 py-2 bg-gray-50 rounded-full">
          <span className="text-sm font-medium text-gray-700">
            {getCurrentPageName()}
          </span>
          <div className="text-xs text-gray-500 text-center mt-1">
            {adjustedIndex + 1} / {pageRoutes.length}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!canGoForward}
          className={`p-3 rounded-full transition-all duration-200 ${
            canGoForward
              ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={t('next_page') || 'Next Page'}
        >
          <IoArrowForwardOutline className="text-xl" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
          style={{ 
            width: `${((adjustedIndex + 1) / pageRoutes.length) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default PageNavigation;