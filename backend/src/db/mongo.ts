import { MongoClient, Db } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment");
  }
  const dbName = process.env.MONGODB_DB_NAME; // optional; can be part of the URI

  client ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  db = dbName ? client.db(dbName) : client.db();
  console.log(`Connected to MongoDB: ${db.databaseName}`);
  // Create indexes (idempotent)
  try {
    await db
      .collection("email_templates")
      .createIndex({ name: 1 }, {
        unique: true,
        name: "uniq_email_templates_name",
        collation: { locale: "en", strength: 2 },
      });
  } catch (e) {
    console.warn("Index creation warning:", (e as any)?.message || e);
  }
  return { client, db };
}

export function getDb(): Db {
  if (!db) throw new Error("Database not connected. Call connectToDatabase() first.");
  return db;
}

export async function disconnectDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    db = undefined;
  }
}
