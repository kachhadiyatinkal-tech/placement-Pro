/* Seed TPO and Admin users
 *
 * Usage:
 * 1. Ensure .env has a valid MONGO_URI
 * 2. From the backend folder, run:
 *    node seed-tpo-admin.js
 *
 * Default credentials (change after first login):
 *   TPO:    tpo@placement.com / tpo123
 *   Admin:  admin@placement.com / admin123
 */

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

require('dotenv').config()

const User = require('./models/user.model')

const SEED_USERS = [
  {
    first_name: 'TPO',
    email: 'tpo@placement.com',
    number: 9876543210,
    password: 'tpo123',
    role: 'tpo',
    tpoProfile: { position: 'Training & Placement Officer' },
  },
  {
    first_name: 'Admin',
    email: 'admin@placement.com',
    number: 9876543211,
    password: 'admin123',
    role: 'admin',
  },
]

async function seedTpoAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri) {
      console.error('MONGO_URI is not set in .env')
      process.exit(1)
    }

    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('Connected.')

    for (const u of SEED_USERS) {
      const hashPassword = await bcrypt.hash(u.password, 10)
      const payload = {
        first_name: u.first_name,
        email: u.email,
        number: u.number,
        password: hashPassword,
        role: u.role,
      }
      if (u.tpoProfile) payload.tpoProfile = u.tpoProfile

      const updated = await User.findOneAndUpdate(
        { email: u.email },
        { $set: payload },
        { upsert: true, new: true }
      )

      console.log(`  ${updated.role}: ${updated.email} (${updated._id})`)
    }

    console.log('\nTPO and Admin seeded successfully.')
    console.log('\nDefault credentials:')
    console.log('  TPO:   tpo@placement.com / tpo123')
    console.log('  Admin: admin@placement.com / admin123')
    console.log('\nChange passwords after first login!')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Error seeding TPO/Admin:', err)
    process.exit(1)
  }
}

seedTpoAdmin()
