# Shiprocket Integration Setup Guide

## 1. Prerequisites
- You must have a Shiprocket account.
- You need your Shiprocket Email and Password.

## 2. Configure Backend
1. Open `backend/.env` file.
2. Add the following lines at the end:
   ```env
   # Shiprocket Configuration
   SHIPROCKET_EMAIL=your_registered_email@example.com
   SHIPROCKET_PASSWORD=your_password_here
   ```
3. Save the file.
4. Restart your backend server.

## 3. How to Use
1. Log in to the Admin Panel of your website.
2. Go to the **Orders** section.
3. Click "Manage" on any order.
4. In the Order Details modal, scroll to the bottom.
5. You will see a "Shiprocket" section.
   - If the order hasn't been shipped yet, click **"Ship via Shiprocket"**.
   - This will automatically:
     - Log in to Shiprocket.
     - Create an order in your Shiprocket account.
     - Generate an AWB number.
     - Update the order status to 'Processing'.
   - Once successfully shipped, the Order ID, Shipment ID, and AWB Code will be displayed in the modal.

## 4. Troubleshooting
- **"Failed to authenticate with Shiprocket"**: Check your email and password in `.env`.
- **"Order already shipped"**: The system prevents duplicate shipments for the same order.
- **Pickup Location**: The integration uses "Primary" as the pickup location. Ensure you have a pickup location with this alias or update `backend/utils/shiprocket.js` to match your actual location alias.
