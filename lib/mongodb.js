import mongoose from 'mongoose'

/**
 * Reuse one connection across Next.js hot reloads and serverless invocations.
 */
const globalForMongoose = globalThis

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = { conn: null, promise: null }
}

const cache = globalForMongoose.mongooseCache

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined')
  }
  if (cache.conn) return cache.conn
  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose.connect(uri)
  }
  cache.conn = await cache.promise
  return cache.conn
}
