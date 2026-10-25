import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { connectDB, getIsMongoConnected } from './server/db.js'
import authRoutes from './server/routes/auth.js'
import jobsRoutes from './server/routes/jobs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', async (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    return next(new Error('JWT_SECRET must be configured in production.'))
  }

  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: getIsMongoConnected(),
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobsRoutes)

if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath))
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ success: false, error: 'Internal server error.' })
})

export default app
