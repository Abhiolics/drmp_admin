# drmp_admin

Operations & Administration Dashboard for the **Dreampay** platform. Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TanStack React Query**, and **Axios**.

---

## ⚡ Connected Services & Configuration

- **Backend API**: [https://drmpbackend.vercel.app/](https://drmpbackend.vercel.app/)
- **Authorized Superadmin**: `abhisheksingh03674@gmail.com`
- **Authentication**: Strict OTP-based administrator verification

---

## 🚀 Key Features

1. **Operations Dashboard**
   - Live cash flow statement visualizations (Deposits vs. Withdrawals)
   - User onboarding rate tracking and metrics
   - Real-time ledger statistics & liabilities overview

2. **User Management & Wallet Auditing**
   - User directory with filtering, searching, and pagination
   - User account status controls (Activate / Deactivate / Block / Unblock)
   - Direct admin ledger adjustment (Credit / Debit user balances)

3. **Deposits Review & Verification**
   - Proof review modal with high-resolution image preview
   - 1-click Approval or Rejection workflows with rejection notes
   - Transaction reference and VPA tracking

4. **Withdrawals Processing**
   - Queue management for pending user withdrawals
   - Complete bank account details & UPI payee information display
   - Instant approval and rejection controls

5. **Subscription Plans**
   - Create, edit, toggle, and delete membership tiers
   - Income-on-approval multipliers and daily earning limits

6. **Task Submissions & Proofs**
   - Create and maintain promotional and reward tasks
   - Audit submitted user proofs and screenshots
   - Automated reward crediting on approval

7. **Gift Codes (Vouchers)**
   - Generate single-use or multi-use redemption codes
   - Expiry dates, redemption counters, and promo reward amounts

8. **Referral Network Audit**
   - Referral commission tracking and multi-tier network inspection
   - Trigger manual commission distribution runs

9. **Merchant UPI Directory**
   - Configure deposit UPI VPAs and primary receiving accounts
   - Active status toggles for seamless payment routing

10. **System Settings & Maintenance**
    - Instant maintenance mode toggle with custom client announcements
    - Force app update version control and store redirect notices
    - Public support contacts management (WhatsApp, Telegram, Help Desk)

---

## 🛠️ Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://drmpbackend.vercel.app/
NEXT_PUBLIC_APP_NAME=Dreampay
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Dreampay Admin Portal.

### 4. Build for Production

```bash
npm run build
npm run start
```
