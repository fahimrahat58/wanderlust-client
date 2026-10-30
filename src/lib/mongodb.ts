import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const connectionString: string = uri;

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

function getMongoClient(): MongoClient {
  const existingClient = globalForMongo.mongoClient;

  if (existingClient) {
    return existingClient;
  }

  const client = new MongoClient(connectionString);
  globalForMongo.mongoClient = client;

  return client;
}

function getMongoClientPromise(): Promise<MongoClient> {
  const existingPromise = globalForMongo.mongoClientPromise;

  if (existingPromise) {
    return existingPromise;
  }

  const client = getMongoClient();
  const clientPromise = client.connect();

  globalForMongo.mongoClientPromise = clientPromise;

  return clientPromise;
}

export const client = getMongoClient();
export const clientPromise = getMongoClientPromise();
export const db = client.db("wanderlust");

// Serverless runtimes (e.g. Vercel) can close the MongoDB driver topology
// between invocations. When the topology is closed, subsequent operations
// (e.g. from Better Auth during `auth.api.getSession`) fail with
// `MongoTopologyClosedError: Topology is closed`. Reconnect the shared
// client whenever the topology gets closed so the next operation transparently
// opens a fresh topology on the same client.
client.on("topologyClosed", async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error(
      "[MongoDB] Failed to reconnect after the topology was closed:",
      error,
    );
  }
});

export async function getDb() {
  const mongoClient = await clientPromise;
  return mongoClient.db("wanderlust");
}

export default clientPromise;
