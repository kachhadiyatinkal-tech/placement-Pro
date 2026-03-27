/** Same rule as backend: inclusive until end of deadline day (UTC). */
export function isApplicationDeadlinePassed(deadline) {
  if (deadline == null || deadline === '') return false
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return false
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth()
  const day = d.getUTCDate()
  const endUtc = Date.UTC(y, m, day, 23, 59, 59, 999)
  return Date.now() > endUtc
}

/** Jobs still accepting applications (no deadline or deadline not passed). */
export function isJobAcceptingApplications(job) {
  if (!job) return false
  return !isApplicationDeadlinePassed(job.applicationDeadline)
}

export function formatDeadlineLabel(deadline) {
  if (deadline == null || deadline === '') return 'No deadline'
  try {
    return new Date(deadline).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}
