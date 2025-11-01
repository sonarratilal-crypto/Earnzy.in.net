import React from 'react';
import { useUserData } from '../hooks/useUserData';
import { Share2, Users, Coin } from 'lucide-react';

export const Referral: React.FC = () => {
  const { userData } = useUserData();

  const referralLink = `https://earnzy.com/invite/${userData?.uid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Refer & Earn</h1>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userData.referrals?.total || 0}</p>
            <p className="text-gray-600">Total Referrals</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Coin className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userData.referrals?.validated || 0}</p>
            <p className="text-gray-600">Validated</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Coin className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{userData.pending_referral_coins}</p>
            <p className="text-gray-600">Pending Coins</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Referral Link</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Referral Rules */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">How Referral Works</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                1
              </div>
              <div>
                <p className="font-semibold">Free → Free User</p>
                <p className="text-gray-600">Earn 2,000 coins when your friend signs up and completes 3 sponsored tasks</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                2
              </div>
              <div>
                <p className="font-semibold">Free → Paid User</p>
                <p className="text-gray-600">Earn 15,000 coins when your friend upgrades to paid plan</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">
                3
              </div>
              <div>
                <p className="font-semibold">Paid → Paid User</p>
                <p className="text-gray-600">Earn 50,000 coins after 7 days and 3 sponsored tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
