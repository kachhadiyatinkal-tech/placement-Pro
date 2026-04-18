import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Mail, ArrowLeft } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import { api } from '../../services/axios'
import { validateEmail } from '../../utils/validation'
import FormError from '../../components/FormError'
import { toastSuccess } from '../../utils/toast'

export default function ForgotPassword() {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (formError) setFormError('')
    if (errors.email) setErrors((s) => ({ ...s, email: '' }))
  }

  const validate = () => {
    const e = {}
    e.email = validateEmail(email)
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const onSubmit = async (ev) => {
    ev?.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setFormError('')

    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setIsSubmitted(true)
      setCountdown(30)
      toastSuccess('Reset link sent to your email')
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  const surface = isDark
    ? 'border-zinc-800 bg-zinc-900/60 backdrop-blur-xl'
    : 'border-white/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-zinc-200/40'

  const inputBase = `w-full rounded-2xl border pl-11 pr-4 py-3.5 text-[15px] leading-snug outline-none transition-all focus:ring-4 focus:ring-indigo-500/15 ${
    isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500' : 'border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600'
  }`

  const primaryBtn = `flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.99] disabled:opacity-60 ${
    isDark
      ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
  }`

  return (
    <div
      className={`relative min-h-dvh flex items-center justify-center px-4 py-12 transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-gradient-to-b from-slate-50 to-indigo-50/40 text-zinc-900'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 -z-10 ${isDark ? 'opacity-30' : 'opacity-40'}`}
        aria-hidden
      >
        <div className="absolute top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-black text-white shadow-lg shadow-brand-500/25">
              P
            </div>
            <div>
              <p className="text-sm font-black tracking-tight uppercase">
                Placement<span className="text-brand-500">Pro</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-60">Elite Suite</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className={`rounded-[2rem] border p-8 sm:p-10 ${surface}`}>
          {!isSubmitted ? (
            <>
              <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Forgot password?</h1>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  No worries, we'll send you reset instructions.
                </p>
              </header>

              <form onSubmit={onSubmit} className="space-y-5">
                <FormError error={formError} className="mt-0" />
                <div className="space-y-1.5">
                  <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Institutional Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={email}
                      onChange={handleEmailChange}
                      type="email"
                      autoComplete="email"
                      className={`${inputBase} ${errors.email ? 'border-red-500 ring-red-500/20' : ''}`}
                      placeholder="you@college.edu"
                    />
                  </div>
                  <FormError error={errors.email} />
                </div>

                <button type="submit" disabled={isLoading} className={`w-full ${primaryBtn}`}>
                  {isLoading ? 'Sending reset link...' : 'Send reset link'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 ring-8 ring-indigo-500/5 dark:text-indigo-400">
                <Mail className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Check your email</h1>
              <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                We've sent a password reset link to <br />
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>. <br />
                Please check your inbox.
              </p>

              <div className="mt-10 space-y-4">
                <Link to="/login" className={`w-full ${primaryBtn}`}>
                  Back to login
                </Link>
                
                <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  Didn't receive the email?{' '}
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading || countdown > 0}
                    className="font-bold text-indigo-600 hover:text-indigo-500 disabled:opacity-50 dark:text-indigo-400"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}