/**
 * Enhanced Intent Detector
 * Detects user intent from message text.
 * Returns an intent string.
 */
function detectIntent(message) {
  const s = message.toLowerCase().trim();

  // Application status
  if (/\b(status|my application|applied|track|shortlist|shortlisted|rejected|selected|interview scheduled)\b/.test(s)) {
    return 'application_status';
  }

  // Apply to a job
  if (/\b(apply|apply for|apply now|submit application)\b/.test(s)) {
    return 'apply_job';
  }

  // Job recommendations
  if (/\b(job|jobs|hiring|vacancy|vacancies|opening|openings|recommend|find job|suitable jobs|matching)\b/.test(s)) {
    return 'get_jobs';
  }

  // Interview help
  if (/\b(interview|interview question|prepare|preparation|tips|tell me about yourself|common question)\b/.test(s)) {
    return 'interview_help';
  }

  // Mock interview
  if (/\b(mock interview|practice interview|start mock|interview practice|simulate)\b/.test(s)) {
    return 'mock_interview';
  }

  // Resume analysis
  if (/\b(resume|analyze resume|cv|check resume|improve resume|resume tips|resume feedback)\b/.test(s)) {
    return 'resume_analysis';
  }

  // General welcome / greet
  if (/^(hi|hello|hey|good morning|good evening|good afternoon|namaste)[\s!.]*$/.test(s)) {
    return 'greeting';
  }

  // Rule-based fallback intents (from old system)
  if (/\b(join|register|signup)\b/.test(s) || /\bsign\s*up\b/.test(s)) {
    return 'register_user';
  }
  if (/\b(login|sign\s*in)\b/.test(s)) {
    return 'login_user';
  }
  if (/\b(contact|help|support)\b/.test(s)) {
    return 'get_contact_info';
  }
  if (/\b(company|companies|connected|partner)\b/.test(s) || /\babout\s+us\b/.test(s)) {
    return 'get_connected_companies';
  }

  return 'general_question';
}

module.exports = { detectIntent };
