import { useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { FiMessageCircle } from 'react-icons/fi';

export default function ChatNotification() {
  const { unreadCount, hasUnreadMessages, isConnected } = useChat();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasUnreadMessages) {
      setIsVisible(true);
      // Hide notification after 5 seconds
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasUnreadMessages]);

  if (!isConnected) return null;

  return (
    <div className="relative">
      <div className="relative">
        <FiMessageCircle className="w-6 h-6 text-gray-600" />
        {hasUnreadMessages && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      
      {/* Toast notification */}
      {isVisible && hasUnreadMessages && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
          <div className="flex items-center space-x-2">
            <FiMessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click to view your messages
          </p>
        </div>
      )}
    </div>
  );
}