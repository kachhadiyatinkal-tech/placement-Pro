// Validation helpers for form fields

export const validateEmail = (email) => {
  if (!email?.trim()) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email.trim())) return 'Enter a valid email address'
  return ''
}

export const validatePassword = (password, minLen = 6) => {
  if (!password) return 'Password is required'
  if (password.length < minLen) return `Password must be at least ${minLen} characters`
  return ''
}

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`
  }
  return ''
}

export const validateNumber = (value, fieldName, min, max) => {
  if (value === '' || value === undefined || value === null) return ''
  const n = Number(value)
  if (isNaN(n)) return `${fieldName} must be a number`
  if (min !== undefined && n < min) return `${fieldName} must be at least ${min}`
  if (max !== undefined && n > max) return `${fieldName} must be at most ${max}`
  return ''
}

/** Number field that must be filled (e.g. salary, SGPA). */
export const validateNumberRequired = (value, fieldName, min, max) => {
  const req = validateRequired(value, fieldName)
  if (req) return req
  return validateNumber(value, fieldName, min, max) || ''
}

export const validatePhone = (value) => {
  if (!value || String(value).trim() === '') return ''
  const digits = String(value).replace(/\D/g, '')
  if (digits.length < 10) return 'Enter a valid phone number'
  return ''
}

export const validatePhoneRequired = (value) => {
  const req = validateRequired(value, 'Phone number')
  if (req) return req
  return validatePhone(value) || ''
}

export const validateMatch = (a, b, message = 'Fields must match') => {
  if (String(a) !== String(b)) return message
  return ''
}
