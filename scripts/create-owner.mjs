/**
 * Creates the gym owner user (bcrypt via User model).
 * From repo root: npm run create-owner
 * Uses .env.local then .env (MONGODB_URI, OWNER_* or CLI args).
 */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { User } from '../lib/models/User.js'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Missing MONGODB_URI in .env.local or .env')
    process.exit(1)
  }

  const name = process.env.OWNER_NAME?.trim() || process.argv[2]?.trim()
  const email = process.env.OWNER_EMAIL?.trim() || process.argv[3]?.trim()
  const password = process.env.OWNER_PASSWORD || process.argv[4]

  if (!name || !email || !password) {
    console.error('Set OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD in .env.local / .env')
    console.error('Or: node scripts/create-owner.mjs "Name" email@example.com password\n')
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters')
    process.exit(1)
  }

  await mongoose.connect(uri)

  const normalized = email.toLowerCase()
  const exists = await User.findOne({ email: normalized })
  if (exists) {
    console.error(`A user already exists for: ${normalized}`)
    await mongoose.disconnect()
    process.exit(1)
  }

  await User.create({ name, email: normalized, password, role: 'admin' })
  console.log('Gym owner created successfully:', normalized)
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  try {
    await mongoose.disconnect()
  } catch {
    /* ignore */
  }
  process.exit(1)
})
