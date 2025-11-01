import React from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Earn from basic tasks', 'Watch ads', 'Referral rewards']
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 99,
    features: ['Higher task rewards', 'More daily tasks', 'Priority support']
  },
  {
    id: 'gold', 
    name: 'Gold',
    price: 249,
    features: ['Even higher rewards', 'Exclusive tasks', 'Faster withdrawals']
  },
  {
    id: 'platinum',
    name: 'Platinum', 
    price: 499,
    features: ['Maximum rewards', 'All exclusive tasks', 'Instant withdrawals']
  }
];

export const Plans: React.FC = () => {
  const handlePurchase = async (planId: string) => {
    // Razorpay integration will go here
    console.log('Purchasing plan:', planId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className={`p-6 ${
                plan.id === 'free' ? 'bg-gray-100' :
                plan.id === 'silver' ? 'bg-gray-200' :
                plan.id === 'gold' ? 'bg-yellow-100' : 'bg-purple-100'
              }`}>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  ₹{plan.price}
                  <span className="text-sm font-normal">/month</span>
                </p>
              </div>
              
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePurchase(plan.id)}
                  className={`w-full py-2 rounded-md font-semibold ${
                    plan.id === 'free' 
                      ? 'bg-gray-300 text-gray-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition`}
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Upgrade Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
