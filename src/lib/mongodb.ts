import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

const client =
  globalForMongo.mongoClient ?? new MongoClient(uri);

const clientPromise =
  globalForMongo.mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = client;
  globalForMongo.mongoClientPromise = clientPromise;
}

export { client, clientPromise };

export const db = client.db("wanderlust");

export default clientPromise;