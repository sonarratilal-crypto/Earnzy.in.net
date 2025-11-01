# Earnzy - Reward & Earning Platform

A full-featured PWA-ready reward platform where users earn coins through tasks, ads, scratch cards, spins, and referrals. Built with React + TypeScript frontend and Firebase backend.

## 🚀 Features

- **Multi-tier Plans**: Free, Silver (₹99), Gold (₹249), Platinum (₹499)
- **Multiple Earning Methods**: Tasks, ads, scratch cards, spin wheels, referrals
- **Secure Withdrawals**: With anti-fraud measures and KYC verification
- **Referral System**: Multi-tier rewards with validation rules
- **Admin Dashboard**: User management, withdrawal approvals, analytics
- **PWA Ready**: Installable progressive web app
- **Payment Integration**: Razorpay for plan purchases and payouts

## 🛠 Tech Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Router, Zustand  
**Backend**: Firebase Auth, Firestore, Cloud Functions  
**Payments**: Razorpay  
**CI/CD**: GitHub Actions  
**Testing**: Jest, Firebase Test SDK

## 📋 Prerequisites

- Node.js 18+
- Firebase project
- Razorpay account (for payments)
- GitHub account (for CI/CD)

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <repository-url>
cd earnzy

# Install frontend dependencies
cd frontend && npm install

# Install functions dependencies  
cd ../functions && npm install
