import * as firebase from '@firebase/testing';
import * as functionsTest from 'firebase-functions-test';

const test = functionsTest();

describe('Withdraw Request Tests', () => {
  let admin: any;

  beforeAll(() => {
    admin = require('firebase-admin');
  });

  beforeEach(async () => {
    // Clear all data
    await firebase.clearFirestoreData({ projectId: 'test-project' });
  });

  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()));
  });

  test('should reject withdraw below minimum amount', async () => {
    const wrapped = test.wrap(require('../src/handlers/requestWithdraw').requestWithdraw);
    
    const context = { auth: { uid: 'user1' } };
    const data = { uid: 'user1', requested_coins: 50000 }; // ₹50, below ₹100 minimum

    await expect(wrapped(data, context)).rejects.toThrow('Minimum withdraw amount is ₹100');
  });

  test('should reject withdraw without sufficient sponsored tasks', async () => {
    // Setup user with coins but insufficient tasks
    const db = admin.firestore();
    await db.collection('users').doc('user1').set({
      uid: 'user1',
      withdrawable_coins: 200000, // ₹200
      sponsored_tasks_completed: 1, // Needs 2 tasks for ₹200
      last_withdraw_time: null,
      flagged: false,
    });

    const wrapped = test.wrap(require('../src/handlers/requestWithdraw').requestWithdraw);
    const context = { auth: { uid: 'user1' } };
    const data = { uid: 'user1', requested_coins: 200000 };

    await expect(wrapped(data, context)).rejects.toThrow('Need 2 sponsored tasks completed');
  });

  test('should create withdraw request when all conditions met', async () => {
    const db = admin.firestore();
    await db.collection('users').doc('user1').set({
      uid: 'user1',
      withdrawable_coins: 200000,
      sponsored_tasks_completed: 3,
      last_withdraw_time: null,
      flagged: false,
    });

    const wrapped = test.wrap(require('../src/handlers/requestWithdraw').requestWithdraw);
    const context = { auth: { uid: 'user1' } };
    const data = { uid: 'user1', requested_coins: 200000 };

    const result = await wrapped(data, context);
    
    expect(result.success).toBe(true);
    expect(result.final_amount_inr).toBe(180); // ₹200 - 10% fee
    
    // Verify user coins were deducted
    const user = await db.collection('users').doc('user1').get();
    expect(user.data().withdrawable_coins).toBe(0);
    
    // Verify withdraw request was created
    const requests = await db.collection('withdraw_requests').where('uid', '==', 'user1').get();
    expect(requests.docs.length).toBe(1);
  });
});
