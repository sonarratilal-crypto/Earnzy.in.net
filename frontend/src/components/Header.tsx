import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Wallet, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">Earnzy</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.phoneNumber}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
