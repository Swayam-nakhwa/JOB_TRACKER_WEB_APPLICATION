import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB, getIsMongoConnected } from './db.js'
import authRoutes from './routes/auth.js'
import jobsRoutes from './routes/jobs.js'

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: getIsMongoConnected(),
    timestamp: new Date().toISOString(),
  })
})

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobsRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ success: false, error: 'Internal server error.' })
})

// Connect to DB and start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Job Tracker Backend Server running on http://localhost:${PORT}`)
    console.log(`📡 MongoDB Status: ${getIsMongoConnected() ? 'CONNECTED' : 'LOCAL FALLBACK ACTIVE'}`)
  })
})
