import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const raw = await readFile(new URL('../src/data/products.json', import.meta.url), 'utf8');
const products = JSON.parse(raw);

const client = new MongoClient(uri);
await client.connect();

const db = client.db(dbName);
const collection = db.collection('products');

await collection.deleteMany({});
await collection.insertMany(products);
await collection.createIndex({ id: 1 }, { unique: true });

console.log(`Seeded ${products.length} products.`);
await client.close();