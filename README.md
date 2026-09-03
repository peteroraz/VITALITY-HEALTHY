<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a4452a3b-9fde-4d78-8e0c-24efde3a83af

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set the Gemini and Firebase values.
3. In Firebase Authentication, enable **Email/Password** under **Sign-in method**.
4. Create a Cloud Firestore database in production mode.
5. Deploy the included deny-by-default rules: `firebase deploy --only firestore:rules,storage`
6. Add each deployed app domain under Firebase Authentication > Settings > Authorized domains.
7. Run the app: `npm run dev`

## Authentication and data security

- Users can create an account, sign in, sign out, and request a password reset.
- Each user's profile is stored at `users/{uid}`.
- Daily logs are stored at `users/{uid}/dailyLogs/{YYYY-MM-DD}`.
- Firestore rules allow a signed-in user to access only their own documents and validate allowed fields and value ranges.
- Firebase Storage is closed until the app has a defined upload feature.
- Express AI routes require a valid Firebase ID token, keeping Gemini usage behind login.

For local server-side token verification, Firebase Admin uses Application Default Credentials. Run `gcloud auth application-default login` or set `GOOGLE_APPLICATION_CREDENTIALS` to a service-account JSON file. Do not commit service-account files or `.env.local`.
