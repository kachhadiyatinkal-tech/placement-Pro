import { toast } from 'react-toastify'

export function toastSuccess(message) {
  toast.success(message, { autoClose: 2000 })
}

export function toastError(message) {
  toast.error(message, { autoClose: 3000 })
}

export function toastApiError(message, status) {
  // Avoid spamming with noisy errors; keep message consistent.
  const prefix = status ? `(${status}) ` : ''
  toast.error(`${prefix}${message}`, { autoClose: 3500 })
}

