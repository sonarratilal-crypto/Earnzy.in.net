import React, { useState } from 'react';
import { useUserData } from '../hooks/useUserData';

export const Withdraw: React.FC = () => {
  const { userData } = useUserData();
  const [amount, setAmount] = useState('');

  const handleWithdraw = async () => {
    if (!userData) return;
    
    const requestedCoins = parseInt(amount) * 1000;
    const requiredTasks = Math.floor(parseInt(amount) / 100);
    
    if (requestedCoins > userData.withdrawable_coins) {
      alert('Insufficient withdrawable coins');
      return;
    }
    
    if (userData.sponsored_tasks_completed < requiredTasks) {
      alert(`Need ${requiredTasks} sponsored tasks (you have ${userData.sponsored_tasks_completed})`);
      return;
    }

    // Call withdraw function
    console.log('Withdrawing:', requestedCoins);
  };

  if (!userData) return null;

  const maxWithdraw = userData.withdrawable_coins / 1000;
  const requiredTasks = Math.floor(parseInt(amount || '0') / 100);
  const fee = parseInt(amount || '0') * 0.1;
  const finalAmount = parseInt(amount || '0') - fee;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Withdraw Funds</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max={maxWithdraw}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum ₹100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Withdrawable: ₹{maxWithdraw.toFixed(2)}
            </p>
          </div>

          {amount && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Withdrawal Details:</h3>
              <div className="text-sm space-y-1">
                <p>Requested: ₹{amount}</p>
                <p>Fee (10%): ₹{fee.toFixed(2)}</p>
                <p className="font-semibold">You receive: ₹{finalAmount.toFixed(2)}</p>
                <p>Required sponsored tasks: {requiredTasks}</p>
                <p>Your completed tasks: {userData.sponsored_tasks_completed}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={!amount || parseInt(amount) < 100 || parseInt(amount) > maxWithdraw}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Request Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
};
