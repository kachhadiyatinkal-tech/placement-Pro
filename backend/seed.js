/* Seed script to populate MongoDB collections from db.sample.json
 *
 * Usage:
 * 1. Ensure .env has a valid MONGO_URI
 * 2. From the backend folder, run:
 *    node seed.js
 */

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

// Load environment variables
require('dotenv').config()

const User = require('./models/user.model')
const Company = require('./models/company.model')
const Job = require('./models/job.model')

async function loadSampleData() {
  const filePath = path.join(__dirname, 'db.sample.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri) {
      console.error('MONGO_URI is not set in .env')
      process.exit(1)
    }

    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('Connected.')

    const data = await loadSampleData()

    // Seed users
    if (Array.isArray(data.users)) {
      console.log('Clearing users collection...')
      await User.deleteMany({})
      console.log('Inserting sample users...')
      await User.insertMany(data.users)
    }

    // Seed companies
    if (Array.isArray(data.companys)) {
      console.log('Clearing companys collection...')
      await Company.deleteMany({})
      console.log('Inserting sample companies...')
      await Company.insertMany(data.companys)
    }

    // Seed jobs
    if (Array.isArray(data.jobs)) {
      console.log('Clearing jobs collection...')
      await Job.deleteMany({})
      console.log('Inserting sample jobs...')
      await Job.insertMany(data.jobs)
    }

    // Optional: Notices collection if model exists
    if (Array.isArray(data.notices)) {
      try {
        const Notice = require('./models/notice.model')
        console.log('Clearing notices collection...')
        await Notice.deleteMany({})
        console.log('Inserting sample notices...')
        await Notice.insertMany(data.notices)
      } catch (err) {
        console.warn(
          'Notice model not found; skipping notices seeding. Error:',
          err.message,
        )
      }
    }

    console.log('Seeding completed successfully.')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Error while seeding database:', err)
    process.exit(1)
  }
}

seed()

