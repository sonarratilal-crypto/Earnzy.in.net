const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedData() {
  console.log('Starting seed data...');

  // Create users
  const users = [];
  
  // Free users
  for (let i = 1; i <= 10; i++) {
    users.push({
      uid: `free_user_${i}`,
      phone: `+9112345678${i}`,
      name: `Free User ${i}`,
      plan: 'free',
      plan_expires_at: null,
      coins: Math.floor(Math.random() * 50000) + 10000,
      withdrawable_coins: Math.floor(Math.random() * 30000) + 5000,
      pending_referral_coins: Math.floor(Math.random() * 20000),
      tasks_completed: Math.floor(Math.random() * 50) + 10,
      sponsored_tasks_completed: Math.floor(Math.random() * 20) + 5,
      referrals: {
        total: Math.floor(Math.random() * 10),
        validated: Math.floor(Math.random() * 5),
        pending: Math.floor(Math.random() * 5),
      },
      flagged: false,
      device_fingerprints: [`device_${i}`],
      last_withdraw_time: null,
      created_at: admin.firestore.Timestamp.now(),
    });
  }

  // Paid users
  const paidPlans = ['silver', 'silver', 'silver', 'gold', 'gold', 'platinum'];
  paidPlans.forEach((plan, i) => {
    users.push({
      uid: `paid_user_${i + 1}`,
      phone: `+911234567${80 + i}`,
      name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} User ${i + 1}`,
      plan,
      plan_expires_at: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      coins: Math.floor(Math.random() * 200000) + 50000,
      withdrawable_coins: Math.floor(Math.random() * 150000) + 30000,
      pending_referral_coins: Math.floor(Math.random() * 50000),
      tasks_completed: Math.floor(Math.random() * 100) + 50,
      sponsored_tasks_completed: Math.floor(Math.random() * 50) + 20,
      referrals: {
        total: Math.floor(Math.random() * 20) + 5,
        validated: Math.floor(Math.random() * 15) + 5,
        pending: Math.floor(Math.random() * 5),
      },
      flagged: false,
      device_fingerprints: [`device_paid_${i}`],
      last_withdraw_time: i % 2 === 0 ? admin.firestore.Timestamp.now() : null,
      created_at: admin.firestore.Timestamp.now(),
    });
  });

  // Sponsored tasks
  const sponsoredTasks = [
    {
      task_id: 'task_install_app',
      title: 'Install Demo App',
      advertiser_id: 'advertiser_1',
      payout_inr: 10,
      platform_share_pct: 80,
      user_share_pct: 20,
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
    },
    {
      task_id: 'task_survey_1',
      title: 'Complete Short Survey',
      advertiser_id: 'advertiser_2',
      payout_inr: 15,
      platform_share_pct: 80,
      user_share_pct: 20,
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
    },
    {
      task_id: 'task_watch_video',
      title: 'Watch Product Video',
      advertiser_id: 'advertiser_3',
      payout_inr: 20,
      platform_share_pct: 80,
      user_share_pct: 20,
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
    },
    {
      task_id: 'task_signup',
      title: 'Sign Up for Service',
      advertiser_id: 'advertiser_4',
      payout_inr: 30,
      platform_share_pct: 80,
      user_share_pct: 20,
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
    },
    {
      task_id: 'task_purchase',
      title: 'Make a Purchase',
      advertiser_id: 'advertiser_5',
      payout_inr: 50,
      platform_share_pct: 80,
      user_share_pct: 20,
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
    },
  ];

  // Referral events
  const referralEvents = [];
  const types = ['free_to_free', 'free_to_paid', 'paid_to_paid'];
  
  for (let i = 1; i <= 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    let amount = 0;
    
    switch (type) {
      case 'free_to_free': amount = 2000; break;
      case 'free_to_paid': amount = 15000; break;
      case 'paid_to_paid': amount = 50000; break;
    }
    
    referralEvents.push({
      ref_id: `ref_${i}`,
      referrer_uid: i <= 10 ? `free_user_${i % 5 || 5}` : `paid_user_${(i % 3) + 1}`,
      referee_uid: `free_user_${(i % 10) + 1}`,
      type,
      amount_coins_pending: amount,
      validated: Math.random() > 0.7,
      validated_at: Math.random() > 0.7 ? admin.firestore.Timestamp.now() : null,
    });
  }

  // Write all data
  try {
    // Users
    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
    }
    console.log(`Created ${users.length} users`);

    // Sponsored tasks
    for (const task of sponsoredTasks) {
      await db.collection('sponsored_tasks').doc(task.task_id).set(task);
    }
    console.log(`Created ${sponsoredTasks.length} sponsored tasks`);

    // Referral events
    for (const ref of referralEvents) {
      await db.collection('referral_events').doc(ref.ref_id).set(ref);
    }
    console.log(`Created ${referralEvents.length} referral events`);

    console.log('Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData();
