import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoClientPromise?: Promise<MongoClient>;
};

export const client = globalForMongo.mongoClient ?? new MongoClient(uri);

if (!globalForMongo.mongoClient) {
  globalForMongo.mongoClient = client;
}

export const db = client.db("wanderlust");

export const clientPromise =
  globalForMongo.mongoClientPromise ?? client.connect();

globalForMongo.mongoClientPromise = clientPromise;

// Serverless runtimes (e.g. Vercel) freeze the function between invocations,
// which drops the TCP connection to MongoDB. When the driver notices, it closes
// the topology and any following operation (e.g. from Better Auth) fails with
// `MongoTopologyClosedError: Topology is closed`. Re-open the connection
// automatically whenever the topology gets closed.
client.on("topologyClosed", () => {
  client.connect().catch((error) => {
    console.error(
      "[MongoDB] Failed to reconnect after the topology was closed:",
      error,
    );
  });
});

export async function getDb() {
  const mongoClient = await clientPromise;

  // `connect()` is a no-op when the topology is open and transparently
  // re-creates it when the previous topology was closed, so the client
  // reconnects instead of reusing a closed topology.
  const connectedClient = await mongoClient.connect();

  return connectedClient.db("wanderlust");
}

export default clientPromise;
