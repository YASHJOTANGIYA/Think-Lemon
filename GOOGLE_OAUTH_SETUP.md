# How to Set Up Google Login (OAuth)

To enable "Continue with Google", you need to create a Google Cloud Project and get a **Client ID**. Follow these steps:

## Step 1: Create a Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Click on the project dropdown at the top left (next to the Google Cloud logo).
4. Click **"New Project"**.
5. Name it "Think Lemon" and click **Create**.

## Step 2: Configure OAuth Consent Screen
1. In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (since you want any Google user to login) and click **Create**.
3. Fill in the required fields:
   - **App Name:** Think Lemon
   - **User Support Email:** Select your email.
   - **Developer Contact Information:** Enter your email.
4. Click **Save and Continue** (you can skip Scopes and Test Users for now).
5. On the Summary page, click **Back to Dashboard**.

## Step 3: Create Credentials
1. In the left sidebar, click **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. **Application Type:** Select **Web application**.
4. **Name:** Web Client 1 (or leave default).
5. **Authorized JavaScript origins:**
   - Click **ADD URI**.
   - Enter: `http://localhost:5173` (This is where your frontend runs).
6. **Authorized redirect URIs:**
   - Click **ADD URI**.
   - Enter: `http://localhost:5173` (and potentially `http://localhost:5173/auth/google/callback` if we used a redirect flow, but for the popup method, just the origin is often enough, or standard libraries might use a specific one. For now, just the origin is key).
7. Click **Create**.

## Step 4: Get Your Client ID
1. A popup will appear with your **Client ID** and **Client Secret**.
2. Copy the **Client ID** (it looks like `123456789-abcdefg.apps.googleusercontent.com`).
3. You don't strictly need the Client Secret for the frontend-only flow, but keep it safe just in case.

## Step 5: Update Your Code
1. Open `.env` file in your `frontend` folder (create one if it doesn't exist).
2. Add this line:
   ```
   VITE_GOOGLE_CLIENT_ID=your-copied-client-id-here
   ```
3. Restart your frontend server (`npm run dev`).
