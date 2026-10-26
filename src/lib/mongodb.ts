import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env file");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

export const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
}

export const clientPromise =
  globalForMongo.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClientPromise = clientPromise;
}

export const db = client.db("wanderlust");

export default clientPromise;
