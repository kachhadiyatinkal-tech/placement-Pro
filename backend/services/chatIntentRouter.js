/**
 * Deterministic routing: keyword rules run before Gemini (requirement).
 * First matching rule wins.
 * @param {string} message
 * @returns {string | null} function name or null to defer to Gemini
 */
function detectRuleBasedIntent(message) {
  const s = message.toLowerCase().trim();

  if (/\b(join|register|signup)\b/.test(s) || /\bsign\s*up\b/.test(s)) {
    return 'register_user';
  }
  if (/\b(login|sign\s*in)\b/.test(s)) {
    return 'login_user';
  }
  if (/\b(job|opening|hiring|vacancy|vacancies)\b/.test(s)) {
    return 'get_job_openings';
  }
  if (/\b(resume|upload|cv|profile)\b/.test(s)) {
    return 'get_resume_upload_info';
  }
  if (
    /\b(contact|help|support)\b/.test(s) ||
    /\bhow\s+(do|can)\s+(i|we)\s+(contact|reach|call)\b/.test(s)
  ) {
    return 'get_contact_info';
  }
  if (
    /\b(company|companies|connected|partner)\b/.test(s) ||
    /\babout\s+us\b/.test(s) ||
    /\bwho\s+are\s+you\b/.test(s) ||
    /\bwhat\s+(services|do\s+you)\b/.test(s)
  ) {
    return 'get_connected_companies';
  }

  return null;
}

module.exports = { detectRuleBasedIntent };
