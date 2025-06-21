
import React from 'react';
import { CurrentUser } from '@/stores/sessionStore';

interface TokenRefreshBannerProps {
  currentUser: CurrentUser;
  onLogout: () => void;
}

const TokenRefreshBanner: React.FC<TokenRefreshBannerProps> = ({ currentUser, onLogout }) => {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-yellow-800 text-sm font-bold">!</span>
            </div>
            <div>
              <p className="text-yellow-800 font-medium">
                Your session needs to be updated to access all features.
              </p>
              <p className="text-yellow-700 text-sm">
                Please log out and log in again to refresh your permissions.
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenRefreshBanner;
