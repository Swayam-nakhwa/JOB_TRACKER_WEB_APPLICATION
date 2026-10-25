import mongoose from 'mongoose'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import bcrypt from 'bcryptjs'

// In-memory / JSON fallback store if MongoDB URI is not connected yet
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json')
const OTPS_FILE = path.join(DATA_DIR, 'otps.json')

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(USERS_FILE)) {
    // Seed default demo account with a REAL bcrypt hashed password
    const hashedPassword = bcrypt.hashSync('password123', 10)
    const initialUsers = [
      {
        id: 'user_alex_1',
        name: 'Alex Johnson',
        email: 'alex.developer@gmail.com',
        password: hashedPassword,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        createdAt: new Date().toISOString(),
      },
    ]
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2))
  }
  if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2))
  }
  if (!fs.existsSync(OTPS_FILE)) {
    fs.writeFileSync(OTPS_FILE, JSON.stringify([], null, 2))
  }
}

let isMongoConnected = false
let connectionPromise

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if ((!uri || uri.trim() === '') && process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI must be configured in production.')
  }

  if (uri && uri.trim() !== '') {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true
      return true
    }

    if (!connectionPromise) {
      connectionPromise = (async () => {
        try {
          await mongoose.connect(uri)
          isMongoConnected = true
          console.log('✅ Connected successfully to MongoDB!')
          return true
        } catch (err) {
          isMongoConnected = false
          if (process.env.NODE_ENV === 'production') {
            throw err
          }
          console.warn('⚠️  Could not connect to MongoDB URI:', err.message)
          console.log('ℹ️  Switching to resilient local JSON database fallback with full bcrypt hashing.')
          ensureDataFiles()
          return false
        }
      })()
    }

    try {
      return await connectionPromise
    } finally {
      connectionPromise = undefined
    }
  } else {
    console.log('ℹ️  No MONGODB_URI provided in .env.')
    console.log('ℹ️  Running in resilient local DB fallback mode with bcrypt password hashing & JWT tokens.')
    ensureDataFiles()
    return false
  }
}

export function getIsMongoConnected() {
  return isMongoConnected
}

// Fallback JSON-based store methods matching Mongoose interface
export const fallbackStore = {
  getUsers() {
    ensureDataFiles()
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'))
    } catch {
      return []
    }
  },
  saveUsers(users) {
    ensureDataFiles()
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  },
  getJobs() {
    ensureDataFiles()
    try {
      return JSON.parse(fs.readFileSync(JOBS_FILE, 'utf-8'))
    } catch {
      return []
    }
  },
  saveJobs(jobs) {
    ensureDataFiles()
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2))
  },
  getOtps() {
    ensureDataFiles()
    try {
      return JSON.parse(fs.readFileSync(OTPS_FILE, 'utf-8'))
    } catch {
      return []
    }
  },
  saveOtps(otps) {
    ensureDataFiles()
    fs.writeFileSync(OTPS_FILE, JSON.stringify(otps, null, 2))
  },
}
