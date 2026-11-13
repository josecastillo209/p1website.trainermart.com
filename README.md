# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Accounts and Authentication

The account system supports:

- Registration with unique usernames and email addresses.
- Server-side validation of account information.
- Password hashing with bcrypt.
- Login and logout using Express sessions stored in MongoDB.
- Restoring the logged-in account after a page refresh.
- Viewing and editing account information.
- Password changes that require the current password.
- Identifying users by their permanent MongoDB `_id`.

### Local Setup

These instructions apply to the current structure, where the React app
is in the repository root and the Express backend is in `server/`.

Use a Node.js version supported by the installed Vite dependencies:
Node 20.19+ within version 20, or Node 22.12+.

Install frontend dependencies from the repository root:

```bash
npm ci
```

Install backend dependencies:

```bash
cd server
npm ci
```

Create a `.env` file inside `server/`:

```dotenv
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=trainermart
SESSION_SECRET=your_random_session_secret
```

Replace the placeholders with your own values. The Atlas connection
string must contain a valid database username and password. URL-encode
special characters in the username or password.

Allow your current IP address in the Atlas network access settings.

Generate a session secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into `SESSION_SECRET`.

Never commit `.env`, database credentials, or session secrets.
The `.env` file is excluded through `.gitignore`.

### Running Locally

Start the backend from `server/`:

```bash
npm run dev
```

In a second terminal, start the frontend from the repository root:

```bash
npm run dev
```

Open the local URL printed by Vite. The Vite development proxy forwards
requests beginning with `/api` to `http://localhost:3000`.

To check the backend connection, open `/api/health` using the Vite URL.

### Account API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/accounts` | Create an account |
| POST | `/api/login` | Authenticate and create a login session |
| GET | `/api/account` | Retrieve the logged-in user's account |
| PUT | `/api/account` | Update the logged-in user's account |
| POST | `/api/logout` | Destroy the session and log out |

Account retrieval and editing require a valid login session.
Password hashes are excluded from account responses.

### Main Account Files

- `server/app.js`: Express setup, database connection, and session storage.
- `server/controllers/accountController.js`: Account validation and operations.
- `server/routes/accountRoutes.js`: Account API routes.
- `src/views/CreateAccountView.jsx`: Registration form.
- `src/views/AccountView.jsx`: Login, account dashboard, and logout.
- `src/components/EditAccountForm.jsx`: Profile and password editing.
- `vite.config.js`: Frontend development proxy.

### Verification

The following were verified locally:

- Account creation through the API and website.
- Rejection of duplicate usernames or email addresses.
- Successful login.
- Login persistence after refreshing the page.
- Profile updates remaining after refresh.
- Logout and rejection of account access afterward.
- Successful production frontend build using `npm run build`.

### Integration Remaining

- Move the React application into the required top-level `client/`
  directory and update setup instructions accordingly.
- Connect the account dashboard to the order-history route.
- Verify account functionality on the deployed Cloud Run application.
- Add the account creation demo to the project Wiki.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
