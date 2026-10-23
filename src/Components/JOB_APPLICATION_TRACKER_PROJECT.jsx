import { useCallback, useEffect, useMemo, useState } from 'react'
import { getJobsKey } from '../constants'
import { apiRequest } from '../utils/api'
import { validateJob } from '../utils/validateJob'
import Dashboard from './Dashboard'
import DeleteConfirmModal from './DeleteConfirmModal'
import JobForm from './JobForm'
import JobToolbar from './JobToolbar'
import JobCardList from './JOB_CARD_DIV'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

/** Default / blank form state used when adding a new application. */
const EMPTY_FORM = {
  CompanyName: '',
  JobRole: '',
  JobUrl: '',
  Status: 'Applied',
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Reads this specific user's job list from localStorage.
 * Returns [] if nothing is saved or the data is malformed.
 */
function loadCachedJobs(userId) {
  try {
    const saved = localStorage.getItem(getJobsKey(userId))
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.map((job) => ({
      JobUrl: '',
      Status: job.Status || 'Applied',
      ...job,
    }))
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

function JobTracker({ userId }) {
  // ── State ──────────────────────────────────────────────────────────────
  const [jobs, setJobs]                 = useState(() => loadCachedJobs(userId))
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [formErrors, setFormErrors]     = useState({})
  const [editingId, setEditingId]       = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy]             = useState('newest')
  const [jobToDelete, setJobToDelete]   = useState(null)
  const [isLoading, setIsLoading]       = useState(false)

  // ── Sync with Backend on Mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    apiRequest('/api/jobs')
      .then(async (res) => {
        if (cancelled) return
        if (res.success && Array.isArray(res.jobs)) {
          if (res.jobs.length > 0) {
            setJobs(res.jobs)
          } else {
            // If server has 0 jobs but local storage has jobs, sync them up to DB
            const local = loadCachedJobs(userId)
            if (local.length > 0) {
              await apiRequest('/api/jobs/sync', {
                method: 'POST',
                body: JSON.stringify({ localJobs: local }),
              })
              const refreshed = await apiRequest('/api/jobs')
              if (!cancelled && refreshed.success && Array.isArray(refreshed.jobs)) {
                setJobs(refreshed.jobs)
              }
            }
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  // ── Local Persistence Cache ────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(getJobsKey(userId), JSON.stringify(jobs))
  }, [jobs, userId])

  // ── Derived: filtered + sorted visible jobs ────────────────────────────
  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = jobs.filter((job) => {
      const matchesStatus = statusFilter === 'All' || job.Status === statusFilter
      const haystack      = `${job.CompanyName} ${job.JobRole} ${job.JobUrl ?? ''}`.toLowerCase()
      const matchesSearch = query === '' || haystack.includes(query)
      return matchesStatus && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (typeof a.id === 'number' ? a.id : 0)
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (typeof b.id === 'number' ? b.id : 0)
        return timeB - timeA
      }
      if (sortBy === 'oldest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (typeof a.id === 'number' ? a.id : 0)
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (typeof b.id === 'number' ? b.id : 0)
        return timeA - timeB
      }
      const nameA = a.CompanyName.toLowerCase()
      const nameB = b.CompanyName.toLowerCase()
      if (sortBy === 'az') return nameA.localeCompare(nameB)
      return nameB.localeCompare(nameA)
    })
  }, [jobs, search, statusFilter, sortBy])

  // ── Form helpers ───────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setEditingId(null)
  }, [])

  /** Handles both Add (new) and Edit (update) form submission. */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()

    const nextErrors = validateJob({
      companyName: form.CompanyName,
      jobRole:     form.JobRole,
      jobUrl:      form.JobUrl,
    })

    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      CompanyName: form.CompanyName.trim(),
      JobRole:     form.JobRole.trim(),
      JobUrl:      form.JobUrl.trim(),
      Status:      form.Status,
    }

    if (editingId) {
      // Optimistic update
      setJobs((prev) => prev.map((job) => (job.id === editingId ? { ...job, ...payload } : job)))
      resetForm()

      const res = await apiRequest(`/api/jobs/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (res.success && res.job) {
        setJobs((prev) => prev.map((job) => (job.id === editingId ? res.job : job)))
      }
    } else {
      const tempId = `temp_${Date.now()}`
      const tempJob = {
        ...payload,
        id: tempId,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }
      // Optimistic addition
      setJobs((prev) => [tempJob, ...prev])
      resetForm()

      const res = await apiRequest('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (res.success && res.job) {
        setJobs((prev) => prev.map((job) => (job.id === tempId ? res.job : job)))
      }
    }
  }, [form, editingId, resetForm])

  /** Updates the status of a single job card in place. */
  const handleStatusChange = useCallback(async (id, status) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, Status: status } : job)))
    await apiRequest(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ Status: status }),
    })
  }, [])

  /** Populates the form with an existing job's data to start editing. */
  const handleStartEdit = useCallback((job) => {
    setEditingId(job.id)
    setForm({
      CompanyName: job.CompanyName,
      JobRole:     job.JobRole,
      JobUrl:      job.JobUrl ?? '',
      Status:      job.Status,
    })
    setFormErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /** Confirms and permanently removes the pending-deletion job. */
  const handleConfirmDelete = useCallback(async () => {
    if (!jobToDelete) return
    const idToDelete = jobToDelete.id

    // Optimistic deletion
    setJobs((prev) => prev.filter((job) => job.id !== idToDelete))
    if (editingId === idToDelete) resetForm()
    setJobToDelete(null)

    await apiRequest(`/api/jobs/${idToDelete}`, {
      method: 'DELETE',
    })
  }, [jobToDelete, editingId, resetForm])

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Stats overview */}
      <Dashboard jobs={jobs} />

      <JobForm
        companyName={form.CompanyName}
        jobRole={form.JobRole}
        jobUrl={form.JobUrl}
        status={form.Status}
        errors={formErrors}
        isEditing={Boolean(editingId)}
        onSubmit={handleSubmit}
        onCancelEdit={resetForm}
        onCompanyChange={(e) => setForm((prev) => ({ ...prev, CompanyName: e.target.value }))}
        onRoleChange={(e) => setForm((prev) => ({ ...prev, JobRole: e.target.value }))}
        onUrlChange={(e) => setForm((prev) => ({ ...prev, JobUrl: e.target.value }))}
        onStatusChange={(e) => setForm((prev) => ({ ...prev, Status: e.target.value }))}
      />

      {/* Search, filter, and sort controls */}
      <JobToolbar
        search={search}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onSearchChange={(e) => setSearch(e.target.value)}
        onStatusFilterChange={(e) => setStatusFilter(e.target.value)}
        onSortByChange={(e) => setSortBy(e.target.value)}
        onResetSearch={() => setSearch('')}
      />

      {/* Job cards list */}
      <JobCardList
        jobs={visibleJobs}
        totalJobCount={jobs.length}
        activeFilter={statusFilter}
        onEdit={handleStartEdit}
        onDelete={(job) => setJobToDelete(job)}
        onStatusChange={handleStatusChange}
      />

      {/* Confirm deletion dialog */}
      <DeleteConfirmModal
        job={jobToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  )
}

export default JobTracker
