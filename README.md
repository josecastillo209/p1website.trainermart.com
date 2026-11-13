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

The React app is in `client/` and the Express backend is in `server/`.

Use Node 20.19+ or Node 22.12+.

Install frontend dependencies:

cd server
npm ci

Install backend dependencies:

cd server
npm ci

Create server/.env (never commit it):

PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB=trainermart
SESSION_SECRET=your_random_session_secret

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

Terminal 1, backend:
cd server
npm run dev

Terminal 2, frontend:
cd client
npm run dev

Open the local URL printed by Vite. The Vite development proxy forwards
requests beginning with /api to http://localhost:3000.
To check the backend connection, open /api/health using the Vite URL.
### Account API

| Method | Endpoint        | Purpose                                 |
| ------ | --------------- | --------------------------------------- |
| POST   | `/api/accounts` | Create an account                       |
| POST   | `/api/login`    | Authenticate and create a login session |
| GET    | `/api/account`  | Retrieve the logged-in user's account   |
| PUT    | `/api/account`  | Update the logged-in user's account     |
| POST   | `/api/logout`   | Destroy the session and log out         |

Account retrieval and editing require a valid login session.
Password hashes are excluded from account responses.
### Main Account Files

server/app.js: Express setup, database connection, and session storage.
server/controllers/accountController.js: Account validation and operations.
server/routes/accountRoutes.js: Account API routes.
src/views/CreateAccountView.jsx: Registration form.
src/views/AccountView.jsx: Login, account dashboard, and logout.
src/components/EditAccountForm.jsx: Profile and password editing.
vite.config.js: Frontend development proxy.

### Verification
The following were verified locally:

Account creation through the API and website.
Rejection of duplicate usernames or email addresses.
Successful login.
Login persistence after refreshing the page.
Profile updates remaining after refresh.
Logout and rejection of account access afterward.
Successful production frontend build using npm run build.

## Shopping Cart
The cart is stored in the Express session and synced with React.

Add, update, and remove items.
Cart survives a page refresh.
Navbar count comes from the session cart.
Cart is cleared after a successful order.

### Cart API

| Method | Endpoint            | Purpose                 |
| ------ | ------------------- | ----------------------- |
| GET    | `/api/cart`         | Return the session cart |
| POST   | `/api/cart`         | Add an item             |
| PUT    | `/api/cart/:itemId` | Update quantity         |
| DELETE | `/api/cart/:itemId` | Remove an item          |

### Main Cart Files

server/controllers/cartController.js
server/routes/cartRoutes.js
src/App.jsx (loads and syncs the cart)

## Checkout and Orders
Checkout collects customer, shipping, billing, and payment details.
The server recalculates prices and totals. Client prices are not trusted.
Only card type and the last four digits are stored.

Customer, shipping, and billing validation.
Card type and last four digits only.
Server-side subtotal, tax (8%), shipping ($5, free at $75), and total.
Orders saved to the MongoDB orders collection.
Order confirmation, history, and detail views.
Users can only see their own orders.

### Order API

| Method | Endpoint          | Purpose                                   |
| ------ | ----------------- | ----------------------------------------- |
| POST   | `/api/orders`     | Place an order from the session cart      |
| GET    | `/api/orders`     | List the logged-in user's orders          |
| GET    | `/api/orders/:id` | Get one order owned by the logged-in user |

Placing an order requires a login session and a non-empty session cart.
### Main Order Files

server/controllers/orderController.js
server/routes/orderRoutes.js
src/views/CheckoutView.jsx
src/views/OrderConfirmationView.jsx
src/views/OrderHistoryView.jsx
src/views/OrderDetailView.jsx
src/utils/orderTotals.js

### Seed products
Products must exist in MongoDB so the server can look up prices.

cd server
node seedProducts.js


## Wiki — Checkout and Orders page

Create a wiki page named **Checkout and Orders**:

```markdown
# Checkout and Orders

Live site: (add Cloud Run URL after deploy)

## What this covers

TrainerMart checkout validates customer, shipping, and billing information in the browser, then places the order through the Express API. Prices and totals are calculated on the server. Only the card type and last four digits are stored.

## Flow

1. User adds items. The cart is stored in the Express session.
2. User opens Checkout and enters customer, shipping, billing, and payment details.
3. Client-side validation blocks incomplete forms.
4. `POST /api/orders` requires a logged-in user.
5. The server looks up each product in MongoDB and ignores client prices.
6. The server calculates subtotal, 8% tax, shipping, and total.
7. The order is saved with card type and last four digits only.
8. The session cart is cleared.
9. The confirmation page shows the saved order.
10. Order history and detail load only that user's orders.

## API

MethodEndpointAuthPOST/api/ordersLogged-in userGET/api/ordersLogged-in userGET/api/orders/:idLogged-in user, own order only


## Main files

- `server/controllers/orderController.js`
- `server/routes/orderRoutes.js`
- `src/views/CheckoutView.jsx`
- `src/views/OrderConfirmationView.jsx`
- `src/views/OrderHistoryView.jsx`
- `src/views/OrderDetailView.jsx`

## Demo

(Add screenshots or a short video after Cloud Run is live.)

1. Log in.
2. Add a product with size and color.
3. Open Cart, then Checkout.
4. Submit valid customer, shipping, and payment details.
5. Show the confirmation page.
6. Open Orders and the order detail page.
