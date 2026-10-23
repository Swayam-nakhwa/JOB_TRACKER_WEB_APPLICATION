import express from 'express'
import { Job } from '../models/Job.js'
import { getIsMongoConnected, fallbackStore } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// Helper to normalize job object with string id
function normalizeJob(job) {
  return {
    id: job._id ? job._id.toString() : job.id,
    CompanyName: job.CompanyName,
    JobRole: job.JobRole,
    JobUrl: job.JobUrl || '',
    Status: job.Status || 'Applied',
    date: job.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

// ── GET ALL JOBS FOR AUTHENTICATED USER ────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    if (getIsMongoConnected()) {
      const jobs = await Job.find({ userId }).sort({ createdAt: -1 })
      return res.json({ success: true, jobs: jobs.map(normalizeJob) })
    } else {
      const allJobs = fallbackStore.getJobs()
      const userJobs = allJobs.filter((j) => j.userId === userId)
      return res.json({ success: true, jobs: userJobs.map(normalizeJob) })
    }
  } catch (err) {
    console.error('Fetch jobs error:', err)
    return res.status(500).json({ success: false, error: 'Failed to retrieve jobs.' })
  }
})

// ── CREATE NEW JOB ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { CompanyName, JobRole, JobUrl, Status, date } = req.body

    if (!CompanyName || !CompanyName.trim()) {
      return res.status(400).json({ success: false, error: 'Company Name is required.' })
    }
    if (!JobRole || !JobRole.trim()) {
      return res.status(400).json({ success: false, error: 'Job Role is required.' })
    }

    const jobData = {
      CompanyName: CompanyName.trim(),
      JobRole: JobRole.trim(),
      JobUrl: (JobUrl || '').trim(),
      Status: Status || 'Applied',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }

    if (getIsMongoConnected()) {
      const newJob = await Job.create({
        ...jobData,
        userId,
      })
      return res.status(201).json({ success: true, job: normalizeJob(newJob) })
    } else {
      const allJobs = fallbackStore.getJobs()
      const newJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...jobData,
        userId,
        createdAt: new Date().toISOString(),
      }
      allJobs.push(newJob)
      fallbackStore.saveJobs(allJobs)
      return res.status(201).json({ success: true, job: normalizeJob(newJob) })
    }
  } catch (err) {
    console.error('Create job error:', err)
    return res.status(500).json({ success: false, error: 'Failed to save job application.' })
  }
})

// ── UPDATE JOB ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const jobId = req.params.id
    const { CompanyName, JobRole, JobUrl, Status, date } = req.body

    const updateFields = {}
    if (CompanyName !== undefined) updateFields.CompanyName = CompanyName.trim()
    if (JobRole !== undefined) updateFields.JobRole = JobRole.trim()
    if (JobUrl !== undefined) updateFields.JobUrl = JobUrl.trim()
    if (Status !== undefined) updateFields.Status = Status
    if (date !== undefined) updateFields.date = date

    if (getIsMongoConnected()) {
      const updatedJob = await Job.findOneAndUpdate(
        { _id: jobId, userId },
        { $set: updateFields },
        { new: true }
      )
      if (!updatedJob) {
        return res.status(404).json({ success: false, error: 'Job not found or unauthorized.' })
      }
      return res.json({ success: true, job: normalizeJob(updatedJob) })
    } else {
      const allJobs = fallbackStore.getJobs()
      const index = allJobs.findIndex((j) => (j.id === jobId || j._id === jobId) && j.userId === userId)
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Job not found or unauthorized.' })
      }
      allJobs[index] = { ...allJobs[index], ...updateFields, updatedAt: new Date().toISOString() }
      fallbackStore.saveJobs(allJobs)
      return res.json({ success: true, job: normalizeJob(allJobs[index]) })
    }
  } catch (err) {
    console.error('Update job error:', err)
    return res.status(500).json({ success: false, error: 'Failed to update job application.' })
  }
})

// ── DELETE JOB ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const jobId = req.params.id

    if (getIsMongoConnected()) {
      const deleted = await Job.findOneAndDelete({ _id: jobId, userId })
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Job not found or unauthorized.' })
      }
      return res.json({ success: true, message: 'Job application deleted successfully.' })
    } else {
      const allJobs = fallbackStore.getJobs()
      const index = allJobs.findIndex((j) => (j.id === jobId || j._id === jobId) && j.userId === userId)
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Job not found or unauthorized.' })
      }
      allJobs.splice(index, 1)
      fallbackStore.saveJobs(allJobs)
      return res.json({ success: true, message: 'Job application deleted successfully.' })
    }
  } catch (err) {
    console.error('Delete job error:', err)
    return res.status(500).json({ success: false, error: 'Failed to delete job application.' })
  }
})

// ── BATCH SYNC (convenient for migrating local jobs to DB) ────────
router.post('/sync', async (req, res) => {
  try {
    const userId = req.user.id
    const { localJobs } = req.body

    if (!Array.isArray(localJobs) || localJobs.length === 0) {
      return res.json({ success: true, count: 0 })
    }

    if (getIsMongoConnected()) {
      const existing = await Job.find({ userId })
      const existingNames = new Set(existing.map((j) => `${j.CompanyName.toLowerCase()}:::${j.JobRole.toLowerCase()}`))

      const toInsert = localJobs
        .filter((j) => j.CompanyName && j.JobRole && !existingNames.has(`${j.CompanyName.toLowerCase()}:::${j.JobRole.toLowerCase()}`))
        .map((j) => ({
          userId,
          CompanyName: j.CompanyName.trim(),
          JobRole: j.JobRole.trim(),
          JobUrl: (j.JobUrl || '').trim(),
          Status: j.Status || 'Applied',
          date: j.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }))

      if (toInsert.length > 0) {
        await Job.insertMany(toInsert)
      }
      return res.json({ success: true, count: toInsert.length })
    } else {
      const allJobs = fallbackStore.getJobs()
      const existing = allJobs.filter((j) => j.userId === userId)
      const existingNames = new Set(existing.map((j) => `${j.CompanyName.toLowerCase()}:::${j.JobRole.toLowerCase()}`))

      let added = 0
      localJobs.forEach((j) => {
        if (j.CompanyName && j.JobRole && !existingNames.has(`${j.CompanyName.toLowerCase()}:::${j.JobRole.toLowerCase()}`)) {
          allJobs.push({
            id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId,
            CompanyName: j.CompanyName.trim(),
            JobRole: j.JobRole.trim(),
            JobUrl: (j.JobUrl || '').trim(),
            Status: j.Status || 'Applied',
            date: j.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            createdAt: new Date().toISOString(),
          })
          added++
        }
      })
      if (added > 0) {
        fallbackStore.saveJobs(allJobs)
      }
      return res.json({ success: true, count: added })
    }
  } catch (err) {
    console.error('Sync error:', err)
    return res.status(500).json({ success: false, error: 'Failed to sync local jobs.' })
  }
})

export default router
