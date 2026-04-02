/**
 * Creates the single gym owner user in MongoDB (bcrypt hash via User model).
 *
 * Usage (pick one):
 *   1) Set OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD in backend/.env then:
 *      npm run create-owner
 *   2) CLI:
 *      node scripts/create-owner.mjs "Gym Owner" owner@example.com yourPassword
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from '../src/models/User.js'

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Missing MONGODB_URI in environment (.env)')
    process.exit(1)
  }

  const name = process.env.OWNER_NAME?.trim() || process.argv[2]?.trim()
  const email = process.env.OWNER_EMAIL?.trim() || process.argv[3]?.trim()
  const password = process.env.OWNER_PASSWORD || process.argv[4]

  if (!name || !email || !password) {
    console.error('Provide owner credentials:\n')
    console.error('  Option A — in backend/.env:')
    console.error('    OWNER_NAME=...')
    console.error('    OWNER_EMAIL=...')
    console.error('    OWNER_PASSWORD=...\n')
    console.error('  Option B — CLI:')
    console.error('    node scripts/create-owner.mjs "Name" email@example.com password\n')
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
