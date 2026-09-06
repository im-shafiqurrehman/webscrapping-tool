import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) {
    await connectionPromise;
    return;
  }
  mongoose.set('sanitizeFilter', true);
  connectionPromise = mongoose
    .connect(env.MONGODB_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 8_000,
    })
    .catch((error: unknown) => {
      connectionPromise = null;
      throw error;
    });
  await connectionPromise;
}

export async function disconnectDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
}
