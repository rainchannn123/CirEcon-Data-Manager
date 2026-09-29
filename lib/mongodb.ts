import { Db, MongoClient } from "mongodb";
import { config } from "./config";

export async function database(): Promise<Db> {
  const globalScope = global as typeof global & {
    cireconMongoClient?: Promise<MongoClient>;
  };
  const clientPromise =
    globalScope.cireconMongoClient ??
    MongoClient.connect(config.mongoUri, { maxPoolSize: 8 });
  if (process.env.NODE_ENV !== "production")
    globalScope.cireconMongoClient = clientPromise;
  return (await clientPromise).db(config.mongoDbName);
}
