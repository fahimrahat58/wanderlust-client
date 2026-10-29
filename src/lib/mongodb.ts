import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = client;
}

const clientPromise = globalForMongo.mongoClientPromise ?? client.connect();

globalForMongo.mongoClientPromise = clientPromise;

export const db = client.db("wanderlust");

export { client, clientPromise };

export async function getDb() {
  await clientPromise;
  return db;
}

export default clientPromise;
