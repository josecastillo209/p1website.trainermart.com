import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MongoClient } from 'mongodb';
import accountRoutes from './routes/accountRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import productRoutes from './routes/productRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100kb' }));

async function startServer() {
  const { MONGODB_URI, MONGODB_DB, SESSION_SECRET } = process.env;

  if (!MONGODB_URI || !MONGODB_DB || !SESSION_SECRET) {
    throw new Error('Missing required environment variables.');
  }

  // Open one database connection and reuse it across requests.
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(MONGODB_DB);
  await db.command({ ping: 1 });

  // Controllers will access the database through req.app.locals.db.
  app.locals.db = db;

  // Enforce unique usernames and emails in the database.
await db.collection('users').createIndex(
  { username: 1 },
  { unique: true }
);

await db.collection('users').createIndex(
  { email: 1 },
  { unique: true }
);

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // Store sessions in MongoDB so requests share login and cart data.
  const sessionStore = MongoStore.create({
    clientPromise: Promise.resolve(client),
    dbName: MONGODB_DB,
    collectionName: 'sessions',
  });

  sessionStore.on('error', () => {
    console.error('Session storage error.');
  });

  app.use(
    session({
      name: 'trainermart.sid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );

  // A simple endpoint to check that the backend is running.
  app.get('/api/health', (req, res) => {
    res.json({ message: 'TrainerMart API is running.' });
  });
  
  app.use('/api', accountRoutes);

  app.use('/api', cartRoutes);

  app.use('/api', orderRoutes); 
  
  app.use('/api', productRoutes);

  app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found.' });
  });

  app.use((error, req, res, next) => {
    console.error('Request failed:', error.name);
    res.status(500).json({ message: 'Something went wrong on the server.' });
  });

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.join(__dirname, 'public');

  app.use(express.static(clientDist));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Connected to MongoDB successfully!');
  });

  // Close the database connection when the server stops.
  function shutdown() {
    server.close(async () => {
      await sessionStore.close();
      await client.close();
      process.exit(0);
    });
  }

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});