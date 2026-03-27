/**
 * Deadline is inclusive through the calendar day of `applicationDeadline` (UTC date parts).
 * After 23:59:59.999 UTC on that day, applications are closed.
 */
function isApplicationDeadlinePassed(deadline) {
  if (deadline == null) return false;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return false;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const endUtc = Date.UTC(y, m, day, 23, 59, 59, 999);
  return Date.now() > endUtc;
}

module.exports = { isApplicationDeadlinePassed };
