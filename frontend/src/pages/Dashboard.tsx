import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useUserData } from '../hooks/useUserData';
import { Coins, Wallet, Clock, Users } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { userData, loading } = useUserData();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!userData) {
    return <div>User data not found</div>;
  }

  const totalInr = userData.coins / 1000;
  const withdrawableInr = userData.withdrawable_coins / 1000;
  const pendingInr = userData.pending_referral_coins / 1000;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Wallet Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Your Wallet</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              userData.plan === 'free' ? 'bg-gray-100 text-gray-800' :
              userData.plan === 'silver' ? 'bg-gray-300 text-gray-800' :
              userData.plan === 'gold' ? 'bg-yellow-100 text-yellow-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {userData.plan.toUpperCase()} Plan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Coins className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-600 font-medium">Total Coins</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{userData.coins.toLocaleString()}</p>
              <p className="text-sm text-gray-600">₹{totalInr.toFixed(2)}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Wallet className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-600 font-medium">Withdrawable</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {userData.withdrawable_coins.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">₹{withdrawableInr.toFixed(2)}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-600 font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {userData.pending_referral_coins.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">₹{pendingInr.toFixed(2)}</p>
            </div>
          </div>

          {/* Withdraw Info */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Withdrawal Rules</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum withdrawal: ₹100 (100,000 coins)</li>
              <li>• Withdrawal fee: 10%</li>
              <li>• 1 withdrawal per day</li>
              <li>• Requires 1 sponsored task per ₹100 requested</li>
              <li>• First withdrawal requires manual review (48-72 hours)</li>
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button className="bg-blue-600 text-white rounded-lg p-4 text-center hover:bg-blue-700 transition">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span>Refer & Earn</span>
          </button>
          
          <button className="bg-green-600 text-white rounded-lg p-4 text-center hover:bg-green-700 transition">
            <Coins className="w-6 h-6 mx-auto mb-2" />
            <span>Daily Tasks</span>
          </button>
          
          <button 
            className={`rounded-lg p-4 text-center transition ${
              withdrawableInr >= 100 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={withdrawableInr < 100}
          >
            <Wallet className="w-6 h-6 mx-auto mb-2" />
            <span>Withdraw</span>
          </button>
          
          <button className="bg-orange-600 text-white rounded-lg p-4 text-center hover:bg-orange-700 transition">
            <span>Upgrade Plan</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{userData.tasks_completed}</p>
              <p className="text-sm text-gray-600">Tasks Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {userData.sponsored_tasks_completed}
              </p>
              <p className="text-sm text-gray-600">Sponsored Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {userData.referrals?.total || 0}
              </p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {userData.referrals?.validated || 0}
              </p>
              <p className="text-sm text-gray-600">Validated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
