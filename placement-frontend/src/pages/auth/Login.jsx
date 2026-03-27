import { useState } from 'react'
import { Briefcase, Lock, Mail, Users } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { campusLogin, companyLogin } from '../../features/auth/authSlice'
import ThemeToggle from '../../components/ThemeToggle'
import { validateEmail, validatePassword } from '../../utils/validation'
import FormError from '../../components/FormError'

const ACCOUNT_TYPES = [
  { id: 'campus', label: 'Campus account', desc: 'Students, TPO, management & admin', icon: Users },
  { id: 'company', label: 'Company', desc: 'Recruiters & hiring partners', icon: Briefcase },
]

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useSelector((s) => s.auth.status)
  const mode = useSelector((s) => s.theme.mode)
  const isDark = mode === 'dark'

  const [accountType, setAccountType] = useState('campus')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const isLoading = status === 'loading'

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (formError) setFormError('')
    if (errors.email) setErrors((s) => ({ ...s, email: '' }))
  }
  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (formError) setFormError('')
    if (errors.password) setErrors((s) => ({ ...s, password: '' }))
  }

  const validate = () => {
    const e = {}
    e.email = validateEmail(email)
    e.password = validatePassword(password)
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const payload = { email: email.trim(), password }

    const action = accountType === 'campus' ? campusLogin(payload) : companyLogin(payload)
    const res = await dispatch(action)
    if (res.meta.requestStatus !== 'fulfilled') {
      const apiErrors = res?.payload?.errors
      if (apiErrors && typeof apiErrors === 'object' && Object.keys(apiErrors).length) {
        setErrors((prev) => ({ ...prev, ...apiErrors }))
      } else {
        setFormError(res?.payload?.message || res?.payload?.msg || 'Sign in failed')
      }
      return
    }

    const from = location.state?.from
    if (from) return navigate(from, { replace: true })

    if (accountType === 'company') {
      navigate('/company/dashboard', { replace: true })
      return
    }

    const role = localStorage.getItem('role')
    if (role === 'tpo') navigate('/tpo/dashboard', { replace: true })
    else if (role === 'admin' || role === 'management') navigate('/admin/dashboard', { replace: true })
    else navigate('/student/dashboard', { replace: true })
  }

  const surface = isDark
    ? 'border-zinc-800 bg-zinc-900/60 backdrop-blur-xl'
    : 'border-white/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-zinc-200/40'

  const inputBase = `w-full rounded-2xl border pl-11 pr-4 py-3.5 text-[15px] leading-snug outline-none transition-all focus:ring-4 focus:ring-indigo-500/15 ${
    isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500' : 'border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-600'
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
        <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-violet-400 blur-[90px] opacity-60" />
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
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Welcome back</h1>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Sign in with the account type that matches your role.
            </p>
          </header>

          <div
            className={`mb-8 grid gap-2 rounded-2xl p-1.5 sm:grid-cols-2 ${
              isDark ? 'bg-zinc-950/80' : 'bg-zinc-100/90'
            }`}
          >
            {ACCOUNT_TYPES.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAccountType(id)}
                className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                  accountType === id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : isDark
                      ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      : 'text-zinc-600 hover:bg-white hover:text-zinc-900'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Icon className="text-base opacity-90" />
                  {label}
                </span>
                <span className={`text-[11px] leading-snug ${accountType === id ? 'text-indigo-100' : 'opacity-80'}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <FormError error={formError} className="mt-0" />
            <div className="space-y-1.5">
              <label
                className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                {accountType === 'company' ? 'Company email *' : 'Email *'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                <input
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                  className={`${inputBase} ${errors.email ? 'border-red-500 ring-red-500/20' : ''}`}
                  placeholder={accountType === 'company' ? 'hr@company.com' : 'you@college.edu'}
                />
              </div>
              <FormError error={errors.email} />
            </div>

            <div className="space-y-1.5">
              <label
                className={`ml-1 text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-zinc-500' : 'text-zinc-500'
                }`}
              >
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                <input
                  value={password}
                  onChange={handlePasswordChange}
                  type="password"
                  autoComplete="current-password"
                  className={`${inputBase} ${errors.password ? 'border-red-500 ring-red-500/20' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              <FormError error={errors.password} />
              <div className="flex justify-end pr-1 pt-0.5">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold transition-all active:scale-[0.99] disabled:opacity-60 ${
                isDark
                  ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className={`mt-8 text-center text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            New here?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
