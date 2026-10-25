import 'dotenv/config'
import process from 'node:process'
import app from '../index.js'
import { connectDB, getIsMongoConnected } from './db.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Job Tracker Backend Server running on http://localhost:${PORT}`)
    console.log(`📡 MongoDB Status: ${getIsMongoConnected() ? 'CONNECTED' : 'LOCAL FALLBACK ACTIVE'}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exitCode = 1
})
