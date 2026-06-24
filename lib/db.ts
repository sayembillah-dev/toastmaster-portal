import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Set it in .env.local");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
