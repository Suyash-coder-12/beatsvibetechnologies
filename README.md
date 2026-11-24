# BeatsVibe One

BeatsVibe One is a responsive company workspace for BeatsVibe Technologies. It includes a local sample-data demo and an Express API designed for Firebase Authentication and Firebase Realtime Database. Live company data is not available until you configure your own Firebase project.

## Requirements

- Node.js 20 or newer
- A Firebase project with Email/Password Authentication and Realtime Database enabled
- A Firebase Admin service-account credential for the Express API

## Create and configure a Firebase project

1. In the Firebase Console, create a project and register a Web app.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Realtime Database**, create a database and note its database URL.
4. In **Realtime Database → Rules**, publish the deny-by-default rules in `database.rules.json`. Browser clients must not access workspace records directly; the API uses the Admin SDK after checking the signed-in user and role.
5. In **Project settings → Service accounts**, create a private key. Store the downloaded JSON outside this repository. Do not commit it or share it in chat.

## Local setup

1. Install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Copy the environment template:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Fill in the Firebase Web app values (`VITE_FIREBASE_*`) and the matching server values (`FIREBASE_PROJECT_ID`, `FIREBASE_DATABASE_URL`). Set `GOOGLE_APPLICATION_CREDENTIALS` to the service-account JSON file path. Keep `.env` and the credential file private.
4. For the first startup only, set both `BOOTSTRAP_OWNER_EMAIL` and `BOOTSTRAP_OWNER_PASSWORD` to create the initial Owner account. Use a strong password of at least 12 characters. Remove both values after the API confirms account creation.
5. Start the frontend and API together:

   ```powershell
   npm.cmd run dev:full
   ```

   Open the Vite URL printed in the terminal. Vite proxies `/api` requests to Express on port 4000. To start them separately, use `npm.cmd run dev` and `npm.cmd run dev:server`.

The API seeds the six BeatsVibe divisions into Realtime Database. Firebase ID tokens are sent as bearer tokens; Express verifies them, loads the user's role from `/users/{uid}`, and enforces permissions on each protected route. The Admin SDK credential remains server-side and must never be added to frontend configuration.

If Firebase is not configured or the API is unavailable, the app offers a separate demo preview using clearly identified sample data. Demo actions never write to Firebase. A Supabase project was not connected in this workspace, so there is no existing Supabase data here to delete or migrate.

## Data and integration status

- Implemented API workflows include dashboard summaries, divisions, employee records, projects, tasks, company events, announcements, workspace users, audit-log reads, and each signed-in user's own profile.
- Direct browser access to the Realtime Database is denied by the supplied rules. Continue enforcing authorization in Express for every new route.
- Microsoft Entra ID, Outlook, email delivery, Teams, SharePoint, OneDrive, and payment processing are not connected. BeatsVibe Payments is a roadmap workspace only; it does not process money.
- Back up the Firebase project and test restores before storing real company data.

## Validation and production build

```powershell
npm.cmd run test:server
npm.cmd run build
```

For production, configure HTTPS, a same-origin frontend/API deployment, private service-account credentials, monitoring, Firebase backups, and a tested recovery process.
