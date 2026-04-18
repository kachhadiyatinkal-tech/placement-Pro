import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Lock, ShieldAlert, Loader2 } from 'lucide-react'
import ThemeToggle from '../../components/ThemeToggle'
import { api } from '../../services/axios'
import { validatePassword, validateMatch } from '../../utils/validation'
import FormError from '../../components/FormError'
import { toastSuccess } from '../../utils/toast'

export default function ResetPassword() {
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(null)
  const [token, setToken] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const t = searchParams.get('token')
    if (t) {
      setToken(t)
      verifyToken(t)
    } else {
      setIsValidToken(false)
    }
  }, [searchParams])

  const verifyToken = async (t) => {
    try {
      await api.post('/auth/verify-reset-token', { token: t })
      setIsValidToken(true)
    } catch (error) {
      setIsValidToken(false)
      setFormError(error?.response?.data?.message || 'Invalid or expired reset link')
    }
  }

  const validate = () => {
    const e = {}
    e.password = validatePassword(password)
    e.confirmPassword = validateMatch(password, confirmPassword, 'Passwords must match')
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setFormError('')

    try {
      await api.post('/auth/reset-password', { token, password })
      toastSuccess('Password reset successful')
      navigate('/login', { replace: true })
    } catch (error) {
      setFormError(error?.response?.data?.message || 'Failed to reset password')
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

  const primaryBtn = `flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.99] disabled:opacity-60 ${
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
          {isValidToken === null ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="mt-4 text-sm font-medium opacity-70">Verifying link...</p>
            </div>
          ) : isValidToken === false ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 ring-8 ring-red-500/5 dark:text-red-400">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Link Expired</h1>
              <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {formError || 'This password reset link is invalid or has already been used.'}
              </p>
              <div className="mt-8">
                <Link to="/forgot-password" className={primaryBtn}>
                  Request new link
                </Link>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Set new password</h1>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Create a secure password for your account.
                </p>
              </header>

              <form onSubmit={onSubmit} className="space-y-5">
                <FormError error={formError} className="mt-0" />
                
                <div className="space-y-1.5">
                  <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors(s => ({...s, password: ''}))
                      }}
                      type="password"
                      className={`${inputBase} ${errors.password ? 'border-red-500 ring-red-500/20' : ''}`}
                      placeholder="••••••••"
                    />
                  </div>
                  <FormError error={errors.password} />
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                    <input
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors(s => ({...s, confirmPassword: ''}))
                      }}
                      type="password"
                      className={`${inputBase} ${errors.confirmPassword ? 'border-red-500 ring-red-500/20' : ''}`}
                      placeholder="••••••••"
                    />
                  </div>
                  <FormError error={errors.confirmPassword} />
                </div>

                <button type="submit" disabled={isLoading} className={primaryBtn}>
                  {isLoading ? 'Resetting password...' : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}